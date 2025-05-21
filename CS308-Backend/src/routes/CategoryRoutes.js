const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const authorizeRole = require('../middleware/authorizeRole');


// GET /api/categories - Get all category types
router.get('/', CategoryController.getCategoryTypes);

// Add new category — only for product managers
router.post('/add', authorizeRole(['product_manager']), CategoryController.addCategory);

// Only for managers
router.get('/all', authorizeRole(['product_manager']), CategoryController.getAllCategories);

// Deactivate category
router.post('/deactivate', authorizeRole(['product_manager']), CategoryController.deactivateCategory);

// Activate category
router.post('/activate', authorizeRole(['product_manager']), CategoryController.activateCategory);

module.exports = router;