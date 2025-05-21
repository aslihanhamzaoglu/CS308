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

class RefundService{

  static async createRefundRequest(productId, quantity, orderId) {
    const [orderRows] = await db.execute('SELECT product_list FROM orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) throw new Error('Order not found');
  
    const order = orderRows[0];
    const productList = typeof order.product_list === 'string' ? JSON.parse(order.product_list) : order.product_list;
    const product = productList.find(p => p.p_id == productId);
    if (!product) throw new Error('Product not found in order');
  
    const [existingRows] = await db.execute(
      'SELECT * FROM refunds WHERE product_id = ? AND order_id = ?',
      [productId, orderId]
    );
    if (existingRows.length > 0) {
      throw new Error('A refund request for this product in this order already exists');
    }
  
    const unitPrice = product.unit_price;
    const amount = (unitPrice * quantity).toFixed(2);
  
    const [result] = await db.execute(
      'INSERT INTO refunds (product_id, quantity, order_id, status, amount) VALUES (?, ?, ?, ?, ?)',
      [productId, quantity, orderId, 'pending', amount]
    );
  
    return result.affectedRows > 0;
  }
  
  static async getRefundsByUser(userId) {
  
    const query = `
      SELECT r.refund_id, r.product_id, r.quantity, r.order_id, r.status, r.amount
      FROM refunds r
      JOIN orders o ON r.order_id = o.order_id
      WHERE o.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
  
  static async getAllRefunds() {
    const query = `
      SELECT 
        r.refund_id, r.product_id, r.quantity, r.order_id, r.status, r.amount,
        u.user_id, u.name, u.email, u.role
      FROM refunds r
      JOIN orders o ON r.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
  
  
  static async processRefundDecision(refundId, decision) {
    // Validate input
    if (!['approved', 'rejected'].includes(decision)) {
      throw new Error('Invalid decision');
    }
  
    // Get refund and associated order
    const [refundRows] = await db.execute(`
      SELECT r.*, o.user_id, o.product_list, p.name AS product_name
      FROM refunds r
      JOIN orders o ON r.order_id = o.order_id
      JOIN products p ON r.product_id = p.id
      WHERE r.refund_id = ?
    `, [refundId]);
  
    if (refundRows.length === 0) {
      throw new Error('Refund request not found');
    }
  
    const refund = refundRows[0];
  
    // Update refund status
    await db.execute('UPDATE refunds SET status = ? WHERE refund_id = ?', [decision, refundId]);
  
    // If approved, restock the product
    if (decision === 'approved') {
      await db.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [refund.quantity, refund.product_id]
      );
    }
  
    // Notify user
    const [userRows] = await db.execute('SELECT email FROM users WHERE user_id = ?', [refund.user_id]);
    const userEmail = userRows[0]?.email;
  
    if (userEmail) {
      const subject = decision === 'approved'
        ? '✅ Your Refund Has Been Approved'
        : '❌ Your Refund Request Was Rejected';
  
      const html = decision === 'approved'
        ? `<p>Your refund request for <strong>${refund.product_name}</strong> has been <strong>approved</strong>.</p>
           <p>Refunded Amount: <strong>$${refund.amount}</strong></p>`
        : `<p>Your refund request for <strong>${refund.product_name}</strong> has been <strong>rejected</strong>.</p>`;
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        html
      });
    }
  
    return { refund_id: refundId, new_status: decision };
  }
  
} 

module.exports = RefundService;