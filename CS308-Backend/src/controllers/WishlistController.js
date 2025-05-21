const WishlistService = require('../services/WishlistService');
const CustomerInfoService = require('../services/CustomerInfoService');
const UserService = require('../services/UserService');

const getWishlist = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Token required" });

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const wishlist = await WishlistService.getWishlistById(customer.wishlist_id);
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    return res.status(200).json({ products: wishlist.products });
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    return res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

const addProductToWishlist = async (req, res) => {
  try {
    const { token, productId } = req.body;

    if (!token || !Number.isInteger(productId)) {
      return res.status(400).json({ message: "Token and valid productId are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const wishlist = await WishlistService.getWishlistById(customer.wishlist_id);
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    if (wishlist.products.includes(productId)) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push(productId);
    const success = await WishlistService.updateWishlist(customer.wishlist_id, wishlist.products);

    if (!success) return res.status(500).json({ message: "Failed to update wishlist" });

    return res.status(200).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Error adding product to wishlist:", error.message);
    return res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};


const removeProductFromWishlist = async (req, res) => {
  try {
    const { token, productId } = req.body;

    if (!token || !Number.isInteger(productId)) {
      return res.status(400).json({ message: "Token and valid productId are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const wishlist = await WishlistService.getWishlistById(customer.wishlist_id);
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const updated = wishlist.products.filter(id => id !== productId);

    const success = await WishlistService.updateWishlist(customer.wishlist_id, updated);
    if (!success) return res.status(500).json({ message: "Failed to update wishlist" });

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing product from wishlist:", error.message);
    return res.status(500).json({ message: "Failed to remove product", error: error.message });
  }
};



const clearWishlist = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Token required" });

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

    const customer = await CustomerInfoService.getCustomerInfoByUserId(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const success = await WishlistService.updateWishlist(customer.wishlist_id, []);
    if (!success) return res.status(400).json({ message: "Failed to clear wishlist" });

    return res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (error) {
    console.error("Error clearing wishlist:", error.message);
    return res.status(500).json({ message: "Failed to clear wishlist", error: error.message });
  }
};

module.exports = {
  getWishlist,
  clearWishlist,
  addProductToWishlist,
  removeProductFromWishlist
};
