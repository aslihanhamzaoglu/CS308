const CustomerInfoService = require('../services/CustomerInfoService');
const UserService = require('../services/UserService');

const getCustomerInfoByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from request parameters
        const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ customer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomerAddresses = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Get customer info
    const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);

    if (!customer) {
      return res.status(404).json({ message: "Customer or customer info not found" });
    }

    return res.status(200).json({
      adressInfo: {
        address: customer.address,
        delivery_address: customer.delivery_address
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch customer profile", error: error.message });
  }
};

const updateCustomerAddress = async (req, res) => {
  try {
    const { token, address } = req.body;

    if (!token || !address) {
      return res.status(400).json({ message: "Token and address are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const success = await CustomerInfoService.updateAddress(userId, address);
    if (!success) return res.status(404).json({ message: "Update failed or customer not found" });

    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Error updating address:", error.message);
    res.status(500).json({ message: "Failed to update address", error: error.message });
  }
};

const updateDeliveryAddress = async (req, res) => {
  try {
    const { token, delivery_address } = req.body;

    if (!token || !delivery_address) {
      return res.status(400).json({ message: "Token and delivery address are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const success = await CustomerInfoService.updateDeliveryAddress(userId, delivery_address);
    if (!success) return res.status(404).json({ message: "Update failed or customer not found" });

    return res.status(200).json({ message: "Delivery address updated successfully" });
  } catch (error) {
    console.error("Error updating delivery address:", error.message);
    res.status(500).json({ message: "Failed to update delivery address", error: error.message });
  }
};

const createCustomerInfo = async (req, res) => {
    try {
        const { user_id, cart_id } = req.body;

        if (!user_id || !cart_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newCustomer = await CustomerInfoService.createCustomerInfo(user_id, cart_id);

        res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getLegalName = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Token required" });

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const legalName = await CustomerInfoService.getLegalNameByUserId(userId);
    return res.status(200).json({ legal_name: legalName });
  } catch (error) {
    res.status(500).json({ message: "Failed to get legal name", error: error.message });
  }
};

const updateLegalName = async (req, res) => {
  try {
    const { token, legal_name } = req.body;

    if (!token || !legal_name) {
      return res.status(400).json({ message: "Token and legal name are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const success = await CustomerInfoService.updateLegalName(userId, legal_name);
    if (!success) return res.status(404).json({ message: "Update failed or customer not found" });

    return res.status(200).json({ message: "Legal name updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update legal name", error: error.message });
  }
};


module.exports = { getCustomerInfoByUserId, getCustomerAddresses, createCustomerInfo, 
  updateCustomerAddress, updateDeliveryAddress, getLegalName, updateLegalName};