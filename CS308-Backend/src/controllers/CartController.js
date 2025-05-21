const CartService = require('../services/CartService');
const UserService = require('../services/UserService');  
const CustomerInfoService = require('../services/CustomerInfoService');  
const ProductService = require('../services/ProductService');

// Controller function to add multiple products to the cart
const addProductsToCart = async (req, res) => {
  const { token, products } = req.body;  // products is an array of { productId, quantity }

  try {
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const cartId = await CustomerInfoService.getCartIdForUser(userId);
    if (!cartId) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

   // For each product in the array, add it to the cart
    let addedProducts;
    for (let product of products) {
      const { productId, quantity } = product;
      const updatedCart = await CartService.addProductToCart(cartId, productId, quantity);
      addedProducts = updatedCart;
    }

    res.status(200).json({ message: 'Products added to cart', cart: addedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add products to cart', error: error.message });
  }
};

// Controller function to remove a product from the cart
const removeProductsFromCart = async (req, res) => {
  const { token, productId, quantity } = req.body;

  try {
    // 1. Get user ID from the token
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 2. Get the user's cart ID from Customer Info Service
    const cartId = await CustomerInfoService.getCartIdForUser(userId);
    if (!cartId) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // 3. Remove the product from the cart using CartService
    const updatedCart = await CartService.removeProductFromCart(cartId, productId, quantity);
    res.status(200).json({ message: 'Product removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove product from cart', error: error.message });
  }
};

// Controller function to get all products in the cart
const getProductsInCart = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Get user ID from the token
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 2. Get the user's cart ID from Customer Info Service
    const cartId = await CustomerInfoService.getCartIdForUser(userId);
    if (!cartId) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // 3. Get the products in the user's cart using CartService
    const products = await CartService.getProductsInCart(cartId);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products from cart', error: error.message });
  }
};

const clearCart = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Get user ID from token
    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 2. Get user's cart ID
    const cartId = await CustomerInfoService.getCartIdForUser(userId);
    if (!cartId) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // 3. Clear the cart
    const clearedCart = await CartService.clearCart(cartId);

    return res.status(200).json({
      message: 'Cart cleared successfully',
    });

  } catch (error) {
    console.error('Error clearing cart:', error.message);
    return res.status(500).json({
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

const checkCartAvailability = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Token required' });

    const userId = await UserService.getUserIdFromToken(token);

    const cart = await CartService.getCartById(userId);
    if (!cart || !cart.products) {
      return res.status(404).json({ message: 'Cart not found or empty' });
    }

    const missingProducts = [];

    for (const productId in cart.products) {
      const requestedQty = cart.products[productId];
      const product = await ProductService.getProductById(productId);

      if (!product) continue; // skip if not found

      const availableStock = product.stock;

      if (availableStock < requestedQty) {
        missingProducts.push({
          productId: Number(productId),
          requestedQty,
          availableStock
        });
      }
    }

    return res.status(200).json({
      valid: missingProducts.length === 0,
      missingProducts
    });

  } catch (error) {
    console.error("Error in checkCartAvailability:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addProductsToCart, removeProductsFromCart, getProductsInCart, clearCart, checkCartAvailability };
