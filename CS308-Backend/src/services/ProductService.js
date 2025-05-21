const Product = require('../models/Product');
const db = require('../config/database');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
  });
class ProductService {

  //Get all products
  static async getAllProducts() {
    const query = 'SELECT * FROM products WHERE status = 1 AND visible = 1';
    const [products] = await db.execute(query);
    return products;
  }

  //Get products by products
  static async getProductsByCategory(categoryId) {
    const query = 'SELECT * FROM products WHERE category_id = ? AND status = 1 AND visible = 1';
    const [rows] = await db.execute(query, [categoryId]);
    return rows;
  }

  static async getProductById(productId) {
    try {
      const query = 'SELECT * FROM products WHERE id = ?';
      const [rows] = await db.execute(query, [productId]);

      if (rows.length > 0) {
        return rows[0];  // Return product details if found
      } else {
        return null;  // Return null if product is not found
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;  // Return null in case of errors
    }
  }

  static async setProductPrice(productId, newPrice) {
    // Step 1: Check current status
    const [rows] = await db.execute('SELECT status FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) return null;
  
    const currentStatus = rows[0].status;
  
    // Step 2: Update price and optionally status
    const query = `
      UPDATE products
      SET price = ?, status = ?
      WHERE id = ?
    `;
    const newStatus = currentStatus === 0 ? 1 : currentStatus;
  
    const [result] = await db.execute(query, [newPrice, newStatus, productId]);
  
    return {
      updated: result.affectedRows > 0,
      wasInactive: currentStatus === 0
    };
  }
  
  static async setDiscountAndNotify(productId, discount) {
    // 1. Update the discount
    const updateQuery = 'UPDATE products SET discount = ? WHERE id = ?';
    const [updateResult] = await db.execute(updateQuery, [discount, productId]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Product not found or discount unchanged');
    }

    // Skip notification if discount is 0
    if (discount === 0) return { notified: false };

    // 2. Get product name for email content
    const [productRows] = await db.execute('SELECT name FROM products WHERE id = ?', [productId]);
    const product = productRows[0];
    if (!product) return { notified: false };

    // 3. Find all wishlists that include the product
    const [wishlists] = await db.execute('SELECT * FROM wishlists');
    const userIdsToNotify = [];

    for (const wishlist of wishlists) {
      let productIds = [];

      try {
        if (typeof wishlist.products === 'string') {
          productIds = JSON.parse(wishlist.products);
        } else if (Array.isArray(wishlist.products)) {
          productIds = wishlist.products;
        }
      } catch (err) {
        console.error(`Failed to parse wishlist ${wishlist.id}:`, err.message);
        continue;
      }
      

      if (Array.isArray(productIds) && productIds.includes(productId)) {
        console.log(`Wishlist ${wishlist.id} includes product ${productId}`);      
        const [customerRows] = await db.execute(
          'SELECT user_id FROM customer_info WHERE wishlist_id = ?',
          [wishlist.id]
        );

        if (customerRows.length > 0) {
          userIdsToNotify.push(customerRows[0].user_id);
        }
      }
    }

    // 4. Send email to each user
    for (const userId of userIdsToNotify) {
      const [userRows] = await db.execute('SELECT email FROM users WHERE user_id = ?', [userId]);
      if (userRows.length > 0) {
        const userEmail = userRows[0].email;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: `📉 Discount on a Wishlist Product!`,
          html: `
            <h3>Discount Alert!</h3>
            <p><strong>${product.name}</strong> in your wishlist is now discounted by ${discount}%.</p>
            <p>Don't miss out — visit DriftMood Coffee to buy it now!</p>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    }

    return { notified: userIdsToNotify.length > 0 };
  }
  
  static async addProduct({
    name,
    model,
    serialNumber,
    description,
    stock = 0,
    warrantyStatus,
    distributor,
    category_id,
    picture
  }) {
    const query = `
      INSERT INTO products (
        name, model, serialNumber, description,
        stock, warrantyStatus,
        distributor, category_id, picture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      name,
      model,
      serialNumber,
      description,
      stock,
      warrantyStatus,
      distributor,
      category_id,
      picture,
    ]);

    return { id: result.insertId, name };
  }

  static async setStock(productId, newStock) {
    const query = 'UPDATE products SET stock = ? WHERE id = ?';
    const [result] = await db.execute(query, [newStock, productId]);
    

    return result.affectedRows > 0;
  }

  static async getStockById(productId) {
    const query = 'SELECT stock FROM products WHERE id = ?';
    const [rows] = await db.execute(query, [productId]);

    if (rows.length > 0) {
      return rows[0].stock;
    }

    return null; // or throw an error if product must exist
  }

  static async getAllProductsForManagers() {
    const query = 'SELECT * FROM products'; // no status filter
    const [rows] = await db.execute(query);
    return rows;
  }

  static async deleteProduct(productId) {
    const query = 'UPDATE products SET visible = 0 WHERE id = ?';
    const [result] = await db.execute(query, [productId]);
    return result.affectedRows > 0; // Returns true if the update was successful
  }

  static async activateProduct(productId) {
    const query = 'UPDATE products SET visible = 1 WHERE id = ?';
    const [result] = await db.execute(query, [productId]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductService