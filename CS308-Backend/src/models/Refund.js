class Refund {
    
    constructor(refund_id, product_id, quantity, order_id, status) 
    {
        this.refund_id = refund_id;
        this.product_id = product_id;
        this.quantity = quantity;
        this.order_id = order_id;
        this.status = status;
    }
}

module.exports = Refund;