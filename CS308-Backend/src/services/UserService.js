const User = require('../models/User');
const db = require('../config/database');
const { hashSHA256 } = require('../utils/cryptoUtils');  // Import the hashSHA256 function

const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');

const CustomerService = require('../services/CustomerInfoService');
const CartService = require('../services/CartService');
const WishlistService = require('../services/WishlistService');



class UserService {
  // Sign up method
  static async signup(name, email, password) {
    const user = await this.findByEmail(email);
    if (user) throw new Error('User already exists');

    const hashedPassword = hashSHA256(password); // Hash the password before storing
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [name, email, hashedPassword, 'customer']);    
    const userId = result.insertId;

    // Create a new empty cart
    const cart = await CartService.createCart();
    const cartId = cart.cart_id;

    const wishlistId = await WishlistService.createWishlist();

    // Create a new customerInfo entry (wishlist_id hardcoded to 0, addresses empty)
    await CustomerService.createCustomerInfo(userId, cartId, wishlistId);
    
    return new User(userId, name, email, hashedPassword, 'customer'); // Return an instance of User
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    if (rows.length > 0) {
    const user = rows[0]; // Return the first matched user
    return new User(user.user_id, user.name, user.email, user.password, user.role);
    }
    return null; // If no user is found
  }

  static async signin(email, password) {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');
    
    const hashedPassword = hashSHA256(password);  // Hash the entered password
    if (user.password !== hashedPassword) {
      throw new Error('Invalid password');
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role }, 
      'your_jwt_secret', 
      { expiresIn: '1h' }
    );
    return {token, role: user.role};
  }

  
  static async getUserIdFromToken(token) {
    try {
      console.log("trying to parse...");
      console.log("token", token);


      // Decode and verify the token using the secret key
      const decoded = jwt.decode(token, process.env.JWT_SECRET);  
      console.log("decoded:", decoded);
      console.log("secret key", process.env.JWT_SECRET)

      // Extract the email from the token
      const email = decoded.email;
      
      if (!email) {
        return null;  // Return null if no email in the token
      }

      // Query the database to get the user ID based on the email
      const query = 'SELECT user_id FROM users WHERE email = ?';
      const [rows] = await db.execute(query, [email]);

      if (rows.length > 0) {
        return rows[0].user_id;  // Return user ID
      } else {
        return null;  // Return null if user not found
      }
    } catch (error) {
      console.error(error);
      return null;  // Return null if token is invalid, expired, or any database errors
    }
  }
  static async getUserById(userId) {
    const query = 'SELECT name, email, user_id, role FROM users WHERE user_id = ?';
    const [rows] = await db.execute(query, [userId]);
    return rows.length ? rows[0] : null;
  }

  static async updateUserName(userId, name) {
    const query = 'UPDATE users SET name = ? WHERE user_id = ?';
    const [result] = await db.execute(query, [name, userId]);
    return result.affectedRows > 0;  // returns true if update was successful
  }
  
  static async changeUserRole(userId, newRole) {
    // Fetch current role
    const [rows] = await db.execute('SELECT role FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0) throw new Error('User not found');
    const currentRole = rows[0].role;
  
    // If switching away from "customer", delete their customer info
    if (currentRole === 'customer' && newRole !== 'customer') {
      await db.execute('DELETE FROM customer_info WHERE user_id = ?', [userId]);
    }
  
    // Update the role
    const [result] = await db.execute('UPDATE users SET role = ? WHERE user_id = ?', [newRole, userId]);
    return result.affectedRows > 0;
  }
  
}

module.exports = UserService