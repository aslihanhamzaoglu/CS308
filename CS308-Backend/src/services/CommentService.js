const db = require('../config/database');
const Comment = require('../models/Comment');  // Import Comment model

class CommentService {
  // Add a new comment
  static async addComment(userId, productId, commentText) {
    const query = 'INSERT INTO comments (user_id, product_id, status, comment) VALUES (?, ?, 0, ?)';
    const [result] = await db.execute(query, [userId, productId, commentText]);

    // Return the new comment object with the comment text
    return new Comment(result.insertId, userId, productId, 0, commentText);
  }

  // Remove a comment
  static async deleteComment(commentId) {
    const query = 'DELETE FROM comments WHERE comment_id = ?';
    const [result] = await db.execute(query, [commentId]);

    return result.affectedRows > 0 ? { commentId, status: 'deleted' } : null;
  }

 static async getCommentsByProduct(productId) {
  const query = `
    SELECT c.*, u.name AS user_name
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.product_id = ? AND c.status = 1
  `;

  const [rows] = await db.execute(query, [productId]);
  return rows;
}

static async getAllCommentsByProduct(productId) {
  const query = `
    SELECT 
      c.comment_id AS id,
      c.product_id,
      c.user_id,
      u.name AS user_name,
      c.comment AS content,
      c.status,
      c.created_at
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.product_id = ?
  `;

  const [rows] = await db.execute(query, [productId]);
  return rows;
}

  // this gets all pending comments - doesnt return declined ones
  static async getAllUnapprovedComments() {
    const query = 'SELECT * FROM comments WHERE status = 0';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getCommentsByUser(userId) {
    const query = `
      SELECT c.*, p.name AS product_name
      FROM comments c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async declineComment(commentId) {
    const query = 'UPDATE comments SET status = -1 WHERE comment_id = ?';
    const [result] = await db.execute(query, [commentId]);

    return result.affectedRows > 0 ? { commentId, status: -1 } : null;
  }

  static async acceptComment(commentId) {
    const query = 'UPDATE comments SET status = 1 WHERE comment_id = ?';
    const [result] = await db.execute(query, [commentId]);

    return result.affectedRows > 0 ? { commentId, status: 1 } : null;
  }


}

module.exports = CommentService;
