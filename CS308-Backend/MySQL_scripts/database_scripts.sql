CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'product_manager', 'sales_manager') NOT NULL DEFAULT 'customer'
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    visible BOOLEAN DEFAULT 1
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serialNumber VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    stock INT NOT NULL CHECK (stock >= 0),
    warrantyStatus ENUM('Yes', 'No') NOT NULL,
    distributor VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    popularity INT DEFAULT 0,
    picture VARCHAR(255) DEFAULT NULL,
    status BOOLEAN DEFAULT FALSE,
    sale_count INT DEFAULT 0,
    visible BOOLEAN DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE carts (
  cart_id INT PRIMARY KEY AUTO_INCREMENT,  
  products JSON
);

CREATE TABLE wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    products JSON NOT NULL
);

CREATE TABLE customer_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wishlist_id INT NOT NULL,
    cart_id INT NOT NULL,
    address VARCHAR(255),
    delivery_address VARCHAR(255),
    legal_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id)
);

CREATE TABLE comments (
  comment_id INT PRIMARY KEY AUTO_INCREMENT,  
  user_id INT NOT NULL,                       
  product_id INT NOT NULL,                    
  status TINYINT DEFAULT 0, -- -1: declined, 0: pending, 1: approved
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id), 
  FOREIGN KEY (product_id) REFERENCES products(id)  
);

CREATE TABLE rate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rate DECIMAL(2,1) NOT NULL CHECK (rate >= 0 AND rate <= 5 AND rate * 2 = FLOOR(rate * 2)),
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_status ENUM('processing', 'in-transit', 'delivered', 'cancelled') NOT NULL DEFAULT 'processing',
    product_list JSON NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    invoice_pdf LONGTEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE refunds (
  refund_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);