const db = require('../config/database');

class CustomerInfoService {

    //Get customer info by user_id
    static async getCustomerInfoByUserId(userId) {
        const query = 'SELECT * FROM customer_info WHERE user_id = ?';
        const [rows] = await db.execute(query, [userId]);
        return rows.length ? rows[0] : null; // Return first match or null if not found
    }

    static async createCustomerInfo(user_id, cart_id, wishlist_id) {
        const address = ""; // Initially empty
        const delivery_address = ""; // Initially empty

        const query = `
            INSERT INTO customer_info (user_id, wishlist_id, cart_id, address, delivery_address) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [user_id, wishlist_id, cart_id, address, delivery_address]);

        return {
            id: result.insertId,
            user_id,
            wishlist_id,
            cart_id,
            address,
            delivery_address
        };
    }
    
    static async updateAddress(userId, address) {
      const query = `UPDATE customer_info SET address = ? WHERE user_id = ?`;
      const [result] = await db.execute(query, [address, userId]);
      return result.affectedRows > 0;
    }
    
    static async updateDeliveryAddress(userId, delivery_address) {
      const query = `UPDATE customer_info SET delivery_address = ? WHERE user_id = ?`;
      const [result] = await db.execute(query, [delivery_address, userId]);
      return result.affectedRows > 0;
    }
    
    static async getCartIdForUser(userId) {
        try {
          const query = 'SELECT cart_id FROM customer_info WHERE user_id = ?';  // Assuming there's a user_id in the carts table
          const [rows] = await db.execute(query, [userId]);
    
          if (rows.length > 0) {
            return rows[0].cart_id;  // Return the cart ID if found
          } else {
            return null;  // Return null if no cart is found for the user
          }
        } catch (error) {
          console.error('Error fetching cart ID:', error);
          return null;  // Return null in case of database errors
        }
      }

          // Get legal name by user ID
    static async getLegalNameByUserId(userId) {
      const query = 'SELECT legal_name FROM customer_info WHERE user_id = ?';
      const [rows] = await db.execute(query, [userId]);
      return rows.length > 0 ? rows[0].legal_name : null;
    }

    // Update legal name
    static async updateLegalName(userId, legalName) {
      const query = 'UPDATE customer_info SET legal_name = ? WHERE user_id = ?';
      const [result] = await db.execute(query, [legalName, userId]);
      return result.affectedRows > 0;
    }

}

module.exports = CustomerInfoService