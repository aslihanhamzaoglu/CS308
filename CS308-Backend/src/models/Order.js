class Order {
    constructor(order_id, user_id,  order_status,  product_list, total_price, address, delivery_status, date ) 
    {
        this.order_id = order_id;
        this.user_id = user_id;
        this.order_status = order_status;
        this.product_list = product_list;
        this.total_price = total_price;
        this.address = address;
        this.date = date;
    }
}

module.exports = Order;