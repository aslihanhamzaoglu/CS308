const db = require('../config/database');
const Wishlist = require('../models/Wishlist');
const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
  });


class WishlistService {

    // Get wishlist by ID
static async getWishlistById(id) {
    const query = 'SELECT * FROM wishlists WHERE id = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length > 0) {
        const row = rows[0];

        // Only parse if it's a string (JSON from DB)
        if (typeof row.products === 'string') {
            try {
                row.products = JSON.parse(row.products || '[]');
            } catch (e) {
                console.error('JSON parsing failed:', row.products);
                row.products = [];
            }
        }

        return row;
    }

    return null;
}
    // Create a new wishlist with initial products (empty)
    static async createWishlist() {
        const query = 'INSERT INTO wishlists (products) VALUES (?)';
        const [result] = await db.execute(query, [JSON.stringify([])]); 

        return result.insertId;
    }

    // Update wishlist with a new product list
    static async updateWishlist(id, products) {
        const query = 'UPDATE wishlists SET products = ? WHERE id = ?';
        const [result] = await db.execute(query, [JSON.stringify(products), id]);
        return result.affectedRows > 0;
    }

    // Delete wishlist by ID
    static async deleteWishlist(id) {
        const query = 'DELETE FROM wishlists WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    static async addProductToWishlist(id, productId) {
        // Step 1: Fetch current wishlist
        const wishlist = await this.getWishlistById(id);
        if (!wishlist) return false;

        // Step 2: Check if productId already exists
        if (wishlist.products.includes(productId)) return true; // nothing to update

        // Step 3: Add product and update
        wishlist.products.push(productId);
        return await this.updateWishlist(id, wishlist.products);
    }

    static async stockMail(productId) {
    try {
      // Step 1: Get all wishlists
      const [wishlists] = await db.execute('SELECT id, products FROM wishlists');

      for (const wishlist of wishlists) {
        let products = [];

        try {
        products = JSON.parse(JSON.stringify(wishlist.products));
        if (!Array.isArray(products)) products = []; // just in case it's not a list
        } catch (e) {
        console.error(`Invalid JSON in wishlist ID ${wishlist.id}:`, wishlist.products);
        continue; // skip this wishlist
        }

        // Step 2: Check if this wishlist contains the productId
        if (!products.includes(productId)) continue;

        // Step 3: Get user linked to this wishlist
        const [customerRows] = await db.execute(
          'SELECT user_id FROM customer_info WHERE wishlist_id = ?',
          [wishlist.id]
        );

        const userId = customerRows[0]?.user_id;
        if (!userId) continue;

        // Step 4: Get user's email
        const [userRows] = await db.execute(
          'SELECT email FROM users WHERE user_id = ?',
          [userId]
        );

        const userEmail = userRows[0]?.email;
        if (!userEmail) continue;

        // Step 5: Get product name
        const [productRows] = await db.execute(
          'SELECT name FROM products WHERE id = ?',
          [productId]
        );

        const productName = productRows[0]?.name || 'a product you wished for';

        // Step 6: Send email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: '🎉 Back in Stock Alert!',
          html: `
            <h2>📦 Your wish is our command!</h2> 
            <p>The product <strong>${productName}</strong> is now back in stock.</p> 
            <p>Visit our store to grab it before it's gone again!</p>
            <p>Thank you for shopping with <strong>DriftMood Coffee</strong> ☕</p>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (err) {
      console.error("Error sending stock availability emails:", err.message);
    }
  }
}

module.exports = WishlistService;
