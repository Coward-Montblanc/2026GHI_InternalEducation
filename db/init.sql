SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS appliance_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE appliance_shop;


DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
  login_id VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE, 
  phone VARCHAR(20) NOT NULL,
  zip_code VARCHAR(10),
  address VARCHAR(255),
  address_detail VARCHAR(255),
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  delflag CHAR(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  stock INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0 COMMENT '0: 판매중, 1: 판매중지, 2: 품절',
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE product_images (
  image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  role VARCHAR(20) DEFAULT 'SUB', -- MAIN / SUB / DETAIL
  image_url VARCHAR(255) NOT NULL,
  image_order INT DEFAULT 1,
  CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carts (
  cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  login_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (login_id) REFERENCES users(login_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_item_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  login_id VARCHAR(50) NOT NULL,
  total_price INT NOT NULL,
  status VARCHAR(20) DEFAULT 'ORDERED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (login_id) REFERENCES users(login_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO categories (category_id, name) VALUES 
(1, '냉방제품'), (2, '공조'), (3, '주방가전'), (4, '세탁'), (5, '소형 생활가전'),
(6, 'TV, 영상'), (7, 'PC제품'), (8, 'IT주변기기'), (9, '모바일'), (10, '음향');