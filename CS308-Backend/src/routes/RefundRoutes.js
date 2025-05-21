const express = require('express');
const router = express.Router();
const refundController = require('../controllers/RefundController');
const authenticateJWT = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');

router.post('/requestRefund', refundController.requestRefund);

router.post('/refundsByUser', refundController.getRefundsByUser);

router.get('/all', authorizeRole(['sales_manager']), refundController.getAllRefunds);

router.post('/refundDecision', authorizeRole(['sales_manager']), refundController.handleRefundDecision);

module.exports = router;