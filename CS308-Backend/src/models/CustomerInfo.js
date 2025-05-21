class CustomerInfo {
    constructor(user_id, customer_id, wishlist_id, cart_id, 
                address, delivery_address, legal_name) 
    {
        this.user_id = user_id;
        this.customer_id = customer_id;
        this.wishlist_id = wishlist_id;
        this.cart_id = cart_id;
        this.address = address;
        this.delivery_address = delivery_address
        this.legal_name = legal_name;
    }
}

module.exports = CustomerInfo;
