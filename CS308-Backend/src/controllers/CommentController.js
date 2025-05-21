const CommentService = require('../services/CommentService');
const UserService = require('../services/UserService');

// Add a comment for a product
const addComment = async (req, res) => {
  try {
    const { token, productId, comment } = req.body;  // Expecting the productId and comment in the body

    // Extract user ID from token (assuming token is sent with the request)
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Add the comment using the service
    const newComment = await CommentService.addComment(userId, productId, comment);
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;  // Extract commentId from request body

    const deletedComment = await CommentService.deleteComment(commentId);
    if (deletedComment) {
      res.status(200).json({ message: 'Comment deleted successfully', comment: deletedComment });
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all approved comments for a product
const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.body;  // Extract productId from request body

    const comments = await CommentService.getCommentsByProduct(productId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments for a product
const getAllCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.body;  // Extract productId from request body

    const comments = await CommentService.getAllCommentsByProduct(productId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getAllUnapprovedComments = async (req, res) => {
  try {
    const comments = await CommentService.getAllUnapprovedComments();
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCommentsByUser = async (req, res) => {
  try {
    const { token } = req.body;

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const comments = await CommentService.getCommentsByUser(userId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const acceptComment = async (req, res) => {
  try {
    const { token, commentId } = req.body;

    if (!token || !commentId) {
      return res.status(400).json({ message: "Token and commentId are required" });
    }

    // Optional: verify token role if needed
    const result = await CommentService.acceptComment(commentId);
    if (!result) return res.status(404).json({ message: "Comment not found or already accepted" });

    return res.status(200).json({ message: "Comment accepted", ...result });
  } catch (error) {
    console.error("Error accepting comment:", error.message);
    return res.status(500).json({ message: "Failed to accept comment", error: error.message });
  }
};

const declineComment = async (req, res) => {
  try {
    const { token, commentId } = req.body;

    if (!token || !commentId) {
      return res.status(400).json({ message: "Token and commentId are required" });
    }

    const result = await CommentService.declineComment(commentId);
    if (!result) return res.status(404).json({ message: "Comment not found or already declined" });

    return res.status(200).json({ message: "Comment declined", ...result });
  } catch (error) {
    console.error("Error declining comment:", error.message);
    return res.status(500).json({ message: "Failed to decline comment", error: error.message });
  }
};

module.exports = { 
  addComment, 
  deleteComment, 
  getCommentsByProduct, 
  getAllUnapprovedComments,
  getCommentsByUser,
  acceptComment,
  declineComment,
  getAllCommentsByProduct
};
