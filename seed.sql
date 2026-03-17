USE ecommerce;

-- Clear existing data (Optional, use with caution)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Customers
INSERT INTO customers (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Tech Enthusiast', 'tech@blog.com');

-- Insert Products
INSERT INTO products (name, price, stock) VALUES 
('Mechanical Keyboard', 120.00, 50),
('Wireless Mouse', 45.50, 100),
('32-inch Monitor', 350.00, 15),
('USB-C Hub', 29.99, 200),
('Noise Cancelling Headphones', 199.99, 30);

-- Insert a Sample Order (Manually)
-- Note: In the app, the logic handles total calculation and stock reduction.
INSERT INTO orders (customer_id, total, status) VALUES (1, 165.50, 'completed');

-- Insert Order Items for the above order
-- (1 Keyboard @ 120 + 1 Mouse @ 45.50)
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 120.00),
(1, 2, 1, 45.50);

-- Update stock manually for the seeded order
UPDATE products SET stock = stock - 1 WHERE id IN (1, 2);