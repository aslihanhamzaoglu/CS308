const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const authorizeRole = require('../middleware/authorizeRole');

// Product manager adds a new product
router.post('/add', authorizeRole(['product_manager']), productController.addProduct);

// Product manager adds a new product
router.post('/get-all', authorizeRole(['product_manager', 'sales_manager']), productController.getAllProductsForManagers);

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

router.post('/get-stock', productController.getStockById);

router.post('/setPrice', authorizeRole(['sales_manager']), productController.setProductPrice);

router.post('/setDiscount', authorizeRole(['sales_manager']), productController.setDiscount);

router.post('/set-stock', authorizeRole(['product_manager']), productController.setStock);

// to delete a product
router.post('/delete', authorizeRole(['product_manager', 'sales_manager']), productController.deleteProduct);

// activate a deleted product
router.post('/activate', authorizeRole(['product_manager', 'sales_manager']), productController.activateProduct);



module.exports = router;