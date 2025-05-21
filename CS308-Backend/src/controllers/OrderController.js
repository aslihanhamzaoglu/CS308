const OrderService = require('../services/OrderService');
const UserService = require('../services/UserService');
const CustomerInfoService = require('../services/CustomerInfoService');
const ProductService = require('../services/ProductService');


const createOrder = async (req, res) => {
  const { token } = req.body;

  try {
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const cartId = await CustomerInfoService.getCartIdForUser(userId);
    if (!cartId) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    const { order, invoiceBase64 } = await OrderService.createOrder(userId, cartId);

    res.status(201).json({
      message: 'Order placed successfully',
      order,
      invoiceBase64 // this can be used in the frontend to render the PDF
    });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    res.status(500).json({
      message: 'Failed to place order',
      error: error.message
    });
  }
};

const changeOrderStatus = async (req, res) => {
  const { orderId, newStatus } = req.body;

  try {
    const result = await OrderService.changeOrderStatus(orderId, newStatus);
    res.status(200).json({
      message: 'Order status updated successfully',
      result
    });
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({
      message: 'Failed to update order status',
      error: error.message
    });
  }
};
/*
const getOrdersByUser = async (req, res) => {
  const { token } = req.body;

  try {
    // Validate token and extract userId
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const orders = await OrderService.getOrdersByUserId(userId);

    return res.status(200).json({
      message: 'Orders fetched successfully',
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};*/
const getOrdersByUser = async (req, res) => {
  const { token } = req.body;

  try {
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const orders = await OrderService.getOrdersByUserId(userId);

    // Enrich products with names


    return res.status(200).json({
      message: 'Orders fetched successfully',
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

const getInvoiceByOrderId = async (req, res) => {
  try {
    const { token, orderId } = req.body;

    if (!token || !orderId) {
      return res.status(400).json({ message: 'Missing token or orderId' });
    }

    const userId = await UserService.getUserIdFromToken(token);
    const invoiceData = await OrderService.getInvoiceByOrderId(userId, orderId);

    res.status(200).json(invoiceData);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getInvoiceByOrderIdAsPM = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Missing orderId' });
    }

    const invoiceBase64 = await OrderService.getInvoiceByOrderIdAsPM(orderId);

    res.status(200).json({ invoiceBase64 });
  } catch (error) {
    console.error('Error fetching invoice (admin):', error.message);
    res.status(500).json({ message: 'Failed to fetch invoice', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const { token, orderId } = req.body;

  try {
    if (!token || !orderId) {
      return res.status(400).json({ message: 'Token and orderId required' });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const result = await OrderService.cancelOrderIfAllowed(orderId, userId);

    res.status(200).json({
      message: 'Order cancelled successfully',
      result
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

const getRevenueGraph = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const revenueData = await OrderService.getRevenueData(startDate, endDate);

    return res.status(200).json({
      message: 'Revenue data fetched successfully',
      data: revenueData
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error.message);
    res.status(500).json({ message: 'Failed to fetch revenue data', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const orders = await OrderService.getAllOrders();
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

module.exports = { createOrder, changeOrderStatus, getOrdersByUser, getInvoiceByOrderId, cancelOrder, getAllOrders, getRevenueGraph, getInvoiceByOrderIdAsPM};