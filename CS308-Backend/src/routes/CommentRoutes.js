const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentController');
const authorizeRole = require('../middleware/authorizeRole');


// Route to add a comment for a product
router.post('/add', commentController.addComment);

// Route to delete a comment
router.post('/delete', commentController.deleteComment);

// Route to get all approved comments for a specific product
router.post('/', commentController.getCommentsByProduct);


// Route to get all unapproved comments 
router.get('/unapproved', commentController.getAllUnapprovedComments);

router.post('/by-user', commentController.getCommentsByUser); 

// Accept a comment
router.post('/accept', authorizeRole(['product_manager']), commentController.acceptComment);

// Decline a comment
router.post('/decline', authorizeRole(['product_manager']), commentController.declineComment);

// Get all of the comments by the product
router.post('/all', authorizeRole(['product_manager']), commentController.getAllCommentsByProduct); 



module.exports = router;
