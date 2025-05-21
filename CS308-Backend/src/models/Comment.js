class Comment {
  constructor(comment_id, user_id, product_id, status = false, comment, created_at) {
    this.comment_id = comment_id;
    this.user_id = user_id;
    this.product_id = product_id;
    this.status = status;
    this.comment = comment;  // Comment text
    this.created_at = created_at; // Timestamp of creation

  }
}

module.exports = Comment;