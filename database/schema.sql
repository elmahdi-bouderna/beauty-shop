CREATE DATABASE IF NOT EXISTS beauty_shop;
USE beauty_shop;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  desc_fr TEXT,
  desc_ar TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('bags', 'perfumes', 'cosmetics') NOT NULL,
  image VARCHAR(255),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255),
  title_ar VARCHAR(255),
  subtitle_fr TEXT,
  subtitle_ar TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2b$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5H6E7LFdnHC');