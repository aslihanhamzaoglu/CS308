const ProductService = require('../services/ProductService');
const WishlistService = require('../services/WishlistService');


const getAllProducts = async (req, res) => {
    try {
      const products = await ProductService.getAllProducts();
      res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await ProductService.getProductsByCategory(categoryId);
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };

  const getAllProductsForManagers = async (req, res) => {
    try {
      const products = await ProductService.getAllProductsForManagers();
      res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  const getStockById = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await ProductService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ stock: product.stock });
  } catch (error) {
    console.error('Error fetching stock:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const setProductPrice = async (req, res) => {
  try {
    const { productId, price } = req.body;

    if (!productId || price == null) {
      return res.status(400).json({ message: 'Product ID and price are required' });
    }

    const result = await ProductService.setProductPrice(productId, price);

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const message = result.wasInactive
      ? 'Product price set and activated successfully'
      : 'Product price updated successfully';

    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error setting product price:', error.message);
    res.status(500).json({ message: 'Failed to set product price', error: error.message });
  }
};

const setDiscount = async (req, res) => {
  try {
    const { productId, discount } = req.body;

    if (!productId || discount === undefined) {
      return res.status(400).json({ message: 'productId and discount are required' });
    }

    const result = await ProductService.setDiscountAndNotify(productId, discount);

    res.status(200).json({
      message: 'Discount set successfully',
      notified: result.notified
    });
  } catch (error) {
    console.error('Error in discount controller:', error.message);
    res.status(500).json({ message: 'Failed to set discount', error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      name, model, serialNumber, description,
      stock, warrantyStatus,
      distributor, category_id, picture
    } = req.body;

    if (!name || !model || !serialNumber || !description ||
        stock == null || !warrantyStatus || !distributor || !category_id) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const product = await ProductService.addProduct({
      name, model, serialNumber, description,
      stock, warrantyStatus,
      distributor, category_id, picture
    });

    return res.status(201).json({ message: "Product added", product });
  } catch (error) {
    console.error("Error adding product:", error.message);
    return res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

const setStock = async (req, res) => {
  try {
    const { token, productId, stock } = req.body;

    if (!token || !productId || stock == null) {
      return res.status(400).json({ message: "Token, productId, and new stock are required" });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: "Stock must be a non-negative integer" });
    }

    let old_stock = await ProductService.getStockById(productId);
    const success = await ProductService.setStock(productId, stock);
    if (!success) {
      return res.status(404).json({ message: "Product not found or stock unchanged" });
    }

    if(old_stock == 0 && stock > 0){
      // email the customers with the product in their wishlist
      await WishlistService.stockMail(productId);
    }

    return res.status(200).json({ message: "Stock updated successfully", productId, stock });
  } catch (error) {
    console.error("Error setting stock:", error.message);
    return res.status(500).json({ message: "Failed to update stock", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const success = await ProductService.deleteProduct(productId);

    if (!success) {
      return res.status(404).json({ message: "Product not found or already hidden" });
    }

    return res.status(200).json({ message: "Product deleted (hidden) successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

const activateProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const success = await ProductService.activateProduct(productId);

    if (!success) {
      return res.status(404).json({ message: "Product not found or already active" });
    }

    return res.status(200).json({ message: "Product reactivated successfully" });
  } catch (error) {
    console.error("Error activating product:", error.message);
    return res.status(500).json({ message: "Failed to activate product", error: error.message });
  }
};

module.exports = { getAllProducts, getProductsByCategory, getAllProductsForManagers, getStockById, addProduct, setStock, setProductPrice, setDiscount, deleteProduct, activateProduct };