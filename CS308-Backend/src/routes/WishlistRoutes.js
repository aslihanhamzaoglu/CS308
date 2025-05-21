const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/WishlistController');

// Get wishlist for the current user (token required)
router.post('/get', wishlistController.getWishlist);

router.post('/add', wishlistController.addProductToWishlist);

router.post('/remove', wishlistController.removeProductFromWishlist);
// Clear wishlist (token required)
router.post('/clear', wishlistController.clearWishlist);

module.exports = router;
