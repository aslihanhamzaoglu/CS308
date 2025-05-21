const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const authorizeRole = require('../middleware/authorizeRole');

router.post('/checkout', orderController.createOrder); 

router.post('/changeOrderStatus', orderController.changeOrderStatus); 

router.post('/getOrdersByUser', orderController.getOrdersByUser); 

router.post('/getInvoice', orderController.getInvoiceByOrderId);

router.post('/cancelOrder', orderController.cancelOrder);

router.post('/revenueGraph', authorizeRole(['sales_manager']), orderController.getRevenueGraph);

router.post('/all', authorizeRole(['product_manager', 'sales_manager']), orderController.getAllOrders);

router.post('/getInvoiceM', authorizeRole(['product_manager', 'sales_manager']), orderController.getInvoiceByOrderIdAsPM);

module.exports = router;