const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');


// Route to remove a product from the cart
router.post('/remove', cartController.removeProductsFromCart);

// Route to get all products in the cart
router.post('/', cartController.getProductsInCart);

router.post('/add', cartController.addProductsToCart); 

router.post('/clear', cartController.clearCart); 

router.post('/check-cart', cartController.checkCartAvailability);

module.exports = router;
