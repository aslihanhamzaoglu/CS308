const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
// can be used to authenticate - in apis
const authenticateJWT = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');

// POST /api/users/signup - Create a new user
router.post('/signup', userController.signup);

// POST /api/users/signin - Sign in an existing user
router.post('/signin', userController.signin);

router.post('/profile', userController.getUserProfile);

router.post('/changeName', userController.changeName);

router.post('/changeUserRole', userController.changeUserRole);

router.post('/test', authorizeRole(['product_manager']), userController.changeName);

module.exports = router;