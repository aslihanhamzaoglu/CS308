const RefundService = require('../services/RefundService');
const UserService = require('../services/UserService');
const OrderService = require('../services/OrderService');

const requestRefund = async (req, res) => {

    try {
      const { token, orderId, productId, quantity } = req.body;
  
      if (!token || !orderId || !productId || !quantity) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const userId = await UserService.getUserIdFromToken(token);
      if (!userId) return res.status(401).json({ message: "Invalid token" });
  
      const order = await OrderService.getOrderById(orderId);
      if (!order || order.user_id !== userId) {
        return res.status(403).json({ message: "You cannot request a refund for this order" });
      }

      if (order.order_status !== 'delivered') {
        return res.status(400).json({ message: "Refund is only available for delivered orders" });
      }

      // Check if product exists in order
      const orderDate = new Date(order.date);
      const now = new Date();
      const daysSincePurchase = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (daysSincePurchase > 30) {
        return res.status(400).json({ message: "Refund period (30 days) has expired" });
      }
  
      const item = order.product_list.find(p => p.p_id == productId);
      if (!item || item.quantity < quantity) {
        return res.status(400).json({ message: "Invalid product or quantity" });
      }
  
      // Store refund request
      const success = await RefundService.createRefundRequest(productId, quantity, orderId);
      if (!success) throw new Error("Failed to store refund request");
  
      res.status(200).json({ message: "Refund request submitted for review" });
    } catch (err) {
      console.error("Refund request error:", err.message);
      res.status(500).json({ message: "Failed to create refund request", error: err.message });
    }
  };
  
  const getRefundsByUser = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) 
        return res.status(400).json({ message: 'Token required' });

      const userId = await UserService.getUserIdFromToken(token);

      if (!userId) 
        throw new Error('Invalid or expired token');

      const refunds = await RefundService.getRefundsByUser(userId);
      return res.status(200).json({ refunds });
    } catch (error) {
      console.error('Error fetching user refunds:', error.message);
      return res.status(500).json({ message: 'Failed to fetch refunds', error: error.message });
    }
  };
  
  const getAllRefunds = async (req, res) => {
    try {
      const refunds = await RefundService.getAllRefunds();
      return res.status(200).json({ refunds });
    } catch (error) {
      console.error('Error fetching all refunds:', error.message);
      return res.status(500).json({ message: 'Failed to fetch refunds', error: error.message });
    }
  };
  
  const handleRefundDecision = async (req, res) => {
    try {
      const { refundId, decision } = req.body;
  
      if (!refundId || !decision) {
        return res.status(400).json({ message: 'Refund ID and decision are required' });
      }
  
      const result = await RefundService.processRefundDecision(refundId, decision);
  
      res.status(200).json({
        message: `Refund request ${decision}`,
        ...result
      });
    } catch (err) {
      console.error('Refund decision error:', err.message);
      res.status(500).json({ message: 'Failed to process refund decision', error: err.message });
    }
  };
  
module.exports = {requestRefund, getRefundsByUser, getAllRefunds, handleRefundDecision};