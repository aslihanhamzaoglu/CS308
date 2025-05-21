class Product {
    constructor(productId, name, price, description, categoryType, 
                distributor, discount, stock, picture, status, 
                warrantyStatus, popularity, costRatio, serialNumber, model, sale_count) 
    {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.categoryId = categoryId;
        this.distributor = distributor;
        this.discount = discount;
        this.stock = stock;
        this.picture = picture;
        this.status = status;
        this.warrantyStatus = warrantyStatus;
        this.popularity = popularity;
        this.costRatio = costRatio;
        this.serialNumber = serialNumber;
        this.model = model;
        this.sale_count = sale_count;
    }
}

module.exports = Product;
