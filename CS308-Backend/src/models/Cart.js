class Cart {
  constructor(cartId, productIds = []) {
    this.cartId = cartId;       
    this.productIds = productIds; 
    /* holds the data as: 
    [
      {"product_id": 101, "quantity": 2},
      {"product_id": 102, "quantity": 1}
    ]
  */
  }
}

module.exports = Cart;