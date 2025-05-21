const db = require('../config/database');  // MySQL database connection
const ProductService = require('./ProductService');  // Import ProductService

class CartService {
  // Get a cart by cartId
  static async getCartById(cartId) {
    const query = 'SELECT * FROM carts WHERE cart_id = ?';
    const [rows] = await db.execute(query, [cartId]);

    if (rows.length > 0) {
      const cart = rows[0];
      return cart;  // Return cart with cart_items (already parsed as JSON)
    }
    return null;  // Return null if no cart found
  }

  // Create a new cart (empty cart)
  static async createCart() {
    const query = 'INSERT INTO carts (products) VALUES (?)';
    const [result] = await db.execute(query, [JSON.stringify({})]);  // Empty cart items array

    return { cart_id: result.insertId, products: [] };  // Return created cart
  }


  // TO DO: can add productId validity check ?
  static async addProductToCart(cartId, productId, quantity = 1) {
    // Fetch the current cart
    const query = 'SELECT * FROM carts WHERE cart_id = ?';
    const [rows] = await db.execute(query, [cartId]);
  
    if (rows.length > 0) {
      const cart = rows[0];
      
      let cartProducts;
      try {
        cartProducts = typeof cart.products === 'string'
          ? JSON.parse(cart.products)
          : cart.products || {};
      } catch (err) {
        console.error('Failed to parse cart.products:', cart.products);
        cartProducts = {};
      }
    
      if (typeof cartProducts !== 'object' || Array.isArray(cartProducts)) {
      cartProducts = {};
      }

      console.log('Raw cart.products from DB:', cart.products);


      // Check if the product already exists in the cart
      if (cartProducts.hasOwnProperty(productId)) {
        // If the product exists, update its quantity
        cartProducts[productId] += quantity;
      } else {
        // If the product doesn't exist, add it to the cart
        cartProducts[productId] = quantity;
      }
  

      // Update the cart in the database with the new cart products
      const updateQuery = 'UPDATE carts SET products = ? WHERE cart_id = ?';
      await db.execute(updateQuery, [JSON.stringify(cartProducts), cartId]);
  
      return { cartId, cartProducts };  // Return updated cart
    }
    return null;  // If cart not found
  }
  


  static async removeProductFromCart(cartId, productId, quantity) {
    // Fetch the current cart
    const query = 'SELECT * FROM carts WHERE cart_id = ?';
    const [rows] = await db.execute(query, [cartId]);
  
    if (rows.length > 0) {
      const cart = rows[0];
      let cartProducts = cart.products;  // Access the 'products' directly from the cart
  
      // Reduce the quantity of the product
      cartProducts[productId] -= quantity;

      // If the quantity is less than or equal to 0, remove the product from the cart
      if (cartProducts[productId] <= 0) {
        delete cartProducts[productId];
      }

      // Update the cart in the database with the new cart products
      const updateQuery = 'UPDATE carts SET products = ? WHERE cart_id = ?';
      await db.execute(updateQuery, [JSON.stringify(cartProducts), cartId]);

      return { cartId, cartProducts };  // Return updated cart

    }
    return null;  // Return null if cart is not found
  }


    static async getProductsInCart(cartId) {
      const query = 'SELECT * FROM carts WHERE cart_id = ?';
      const [rows] = await db.execute(query, [cartId]);
  
      if (rows.length > 0) {
        const cart = rows[0];
        console.log("some stuff:", cart);  // Logging cart data for debugging
  
        // Parse the products JSON (assuming it's stored as a JSON object)
        //const productsInCart = JSON.parse(cart.products);
        const productsInCart = cart.products;

        const productDetails = [];
        
        // Loop through the products in the cart
        for (let productId in productsInCart) {
          // Get the product details using the ProductService
          const product = await ProductService.getProductById(productId);
          
          if (product) {
            // Push the product details with quantity into the productDetails array
            productDetails.push({
              product: product,  // Product details (from ProductService)
              count: productsInCart[productId]  // Quantity from the cart
            });
          }
        }
  
        return productDetails;  // Return an array of products with details and count
      }
  
      return [];  // Return an empty array if no cart found
    }

    static async clearCart(cartId) {
      const query = 'UPDATE carts SET products = ? WHERE cart_id = ?';
      const emptyCart = {};
      await db.execute(query, [JSON.stringify(emptyCart), cartId]);
    
      return { cartId, products: emptyCart };
    }
    
}

module.exports = CartService;
