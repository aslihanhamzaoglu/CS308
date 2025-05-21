INSERT INTO users (name, email, password) VALUES
('Alice Johnson', 'alice@example.com', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6'), -- password123
('Bob Smith', 'bob@example.com', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6'),
('Charlie Lee', 'charlie@example.com', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6'),
('Irem', 'irem.gezgen@sabanciuniv.edu', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6'),
('Alım', 'alimgurbuz@sabanciuniv.edu','c748037d6302b6c0de3e8a0169ec37b183cd084bcef8e7a467de02c71b2e9ac7');

INSERT INTO users (name, email, password, role) VALUES
('Sales Guy', 's@sabanciuniv.edu', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6', 'sales_manager'), -- password123
('Product Guy', 'p@sabanciuniv.edu', '4e1f7890e2468130247e9d84fc96e82f01a20c754e19d92ae700f17948671fb6', 'product_manager');


INSERT INTO categories (name) VALUES
('Beverages'),
('Snacks'),
('Merchandise'),
('Gift Cards');


INSERT INTO products (name, model, serialNumber, description, price, discount, stock, warrantyStatus, distributor, category_id, popularity, picture, status, sale_count)
VALUES
    ('Caramel Macchiato', 'CM001', 'SN1001', 'Espresso with steamed milk and caramel drizzle.', 4.99, 0, 50, 'No', 'DriftMood', 1, 39.87, 'https://globalassets.starbucks.com/digitalassets/products/bev/SBX20211029_CaramelMacchiato.jpg?impolicy=1by1_wide_topcrop_630', 1, 25),
    ('Pumpkin Spice Latte', 'PSL002', 'SN1002', 'Seasonal espresso drink with pumpkin and spices.', 5.49, 10, 30, 'No', 'DriftMood', 1, 39.29, 'https://iyikahvalti.com/wp-content/uploads/2023/09/PumpkinSpiceLatte.jpg', 1, 20),
    ('DriftMood Classic Mug', 'MUG001', 'SN2001', 'A classic DriftMood ceramic mug.', 12.99, 5, 100, 'Yes', 'DriftMood', 3, 23.62, 'https://i.imgur.com/pniOGtB.png', 1, 8),
    ('Reusable Tumbler', 'TMB002', 'SN2002', 'A reusable tumbler with DriftMood logo.', 14.99, 0, 75, 'Yes', 'DriftMood', 3, 20.26,  'https://i.imgur.com/dmhilx9.png', 1, 18),
    ('Chocolate Chip Cookie', 'CK003', 'SN3001', 'A delicious soft chocolate chip cookie.', 2.49, 0, 60, 'No', 'DriftMood', 2, 35.26, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST2oJ9U1rYhHNczOQyqgjukfQSyaH9CepaSg&s', 1, 18),
    ('Blueberry Muffin', 'MF004', 'SN3002', 'A moist blueberry muffin with sugar topping.', 3.29, 5, 40, 'No', 'DriftMood', 2, 29.72, 'https://stressbaking.com/wp-content/uploads/2022/07/blueberry-muffins-06.jpg', 1, 15),
    ('Cold Brew Coffee', 'CB005', 'SN1003', 'Slow-steeped, smooth cold brew coffee.', 3.99, 0, 45, 'No', 'DriftMood', 1, 19.15, 'https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/59349/uploads/urunresimleri/buyuk/cold-brew-200-cc-135-87.png', 1, 10),
    ('Green Tea Latte', 'GTL006', 'SN1004', 'Matcha green tea blended with steamed milk.', 4.59, 0, 35, 'No', 'DriftMood', 1, 24.57, 'https://munchingwithmariyah.com/wp-content/uploads/2020/06/IMG_0748.jpg', 1, 5),
    ('DriftMood Gift Card', 'GC007', 'SN4001', 'A DriftMood gift card with a $25 balance.', 25.00, 0, 200, 'No', 'DriftMood', 4, 35.18, 'https://media.istockphoto.com/id/1200796811/tr/foto%C4%9Fraf/k%C4%B1rm%C4%B1z%C4%B1-renkli-yayl%C4%B1-hediye-kartlar%C4%B1.jpg?s=612x612&w=0&k=20&c=NIYEqoDsQrXgtA6KM_O3ZFAD9aQ_Nq-nDDGXwIc_w8M=', 1, 12),
    ('Espresso Shot', 'ESP008', 'SN1005', 'A strong, rich espresso shot.', 2.00, 0, 70, 'No', 'DriftMood', 1, 16.07, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnzniHknGW71pl9HIW5D4hNXTUB-E7IN9DAA&s', 1, 5);
    
    
    
INSERT INTO carts (products) VALUES
('{"1": 2, "5": 1}'), -- 2x Caramel Macchiato, 1x Chocolate Chip Cookie
('{"2": 1, "4": 2}'), -- 1x Pumpkin Spice Latte, 2x Reusable Tumbler
('{"6": 3}'),         -- 3x Blueberry Muffin
('{}'),       
('{}');      


INSERT INTO wishlists (products) VALUES
('[1, 5]'),
('[]'),
('[]'),
('[]'),
('[]');

INSERT INTO customer_info (user_id, wishlist_id, cart_id, address, delivery_address, legal_name) VALUES
(1, 1, 1, '123 Main St, Springfield', '456 Oak Ave, Springfield', 'Alice Johnson'),
(2, 2, 2, '789 Pine St, Rivertown', '101 Maple Rd, Rivertown', 'Bob Smith'),
(3, 3, 3, '202 Elm St, Lakeside', '303 Birch Blvd, Lakeside', 'Charlie Lee'),
(4, 4, 4, 'Sabancı', 'Sabancı', 'İrem Gezgen'),
(5, 5, 5, 'Sabancı', 'Sabancı', 'Alım Gürbüz');


INSERT INTO comments (user_id, product_id, status, comment, created_at) VALUES
(1, 1, TRUE, 'Love the Caramel Macchiato! It is my go-to drink every morning.', '2025-04-01 08:15:00'),
(2, 2, TRUE, 'The Pumpkin Spice Latte is amazing! Perfect for the fall season.', '2025-04-02 10:30:00'),
(3, 3, TRUE, 'The DriftMood Classic Mug is awesome. I love using it for my coffee every day.', '2025-04-03 12:45:00'),
(1, 5, TRUE, 'The chocolate chip cookie is delicious. Perfectly soft and chewy!', '2025-04-04 14:20:00'),
(2, 6, TRUE, 'The blueberry muffin is a great snack with my coffee. So tasty!', '2025-04-05 09:10:00');

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 1, 4.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 1, 5.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 1, 4.0);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 2, 5.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 2, 4.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 2, 5.0);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 3, 3.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 3, 3.5);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 4, 1.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 4, 2.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 4, 2.0);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 5, 4.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 5, 4.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 5, 4.5);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 6, 3.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 6, 4.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 6, 3.5);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 7, 2.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 7, 2.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 7, 2.5);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 8, 4.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 8, 3.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 8, 3.5);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 9, 5.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 9, 4.5);
INSERT INTO rate (user_id, product_id, rate) VALUES (3, 9, 5.0);

INSERT INTO rate (user_id, product_id, rate) VALUES (1, 10, 2.0);
INSERT INTO rate (user_id, product_id, rate) VALUES (2, 10, 2.5);

