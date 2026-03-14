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
DROP TABLE IF EXISTS event_images;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS notice_images;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS users;

-- 会員情報
CREATE TABLE users (
  login_id VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE, 
  phone VARCHAR(20) NOT NULL,
  zip_code VARCHAR(10),
  address VARCHAR(255),
  address_detail VARCHAR(255),
  status TINYINT DEFAULT 0,  /* 0=회원, 1=탈퇴 */
  role VARCHAR(20) DEFAULT 'USER',  /* USER=一般, ADMIN=管理者 */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品カテゴリ
CREATE TABLE categories (
  category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  delflag CHAR(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品 (ID：PD1 形式で表示)
CREATE TABLE products (
  product_id VARCHAR(10) PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  stock INT NOT NULL,
  view INT DEFAULT 0, /*view*/
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0, /* 0=販売中, 1=販売停止, 2=品切れ */
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品画像
CREATE TABLE product_images (
  image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(10) NOT NULL,
  role TINYINT DEFAULT 2, /* 1=メイン, 2=サブ ,　3＝詳細*/
  image_url VARCHAR(255) NOT NULL,
  image_order INT DEFAULT 1, /* 1=メイン, 2=サブ */
  CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- カート (ID：CT1 形式で表示)
CREATE TABLE carts (
  cart_id VARCHAR(10) PRIMARY KEY,
  login_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (login_id) REFERENCES users(login_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- カート内商品
CREATE TABLE cart_items (
  cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id VARCHAR(10) NOT NULL,
  product_id VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  status TINYINT DEFAULT 0, /* 0=表示中, 1=非表示 */
  CONSTRAINT fk_item_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 注文 (ID：OD1 形式で表示)
CREATE TABLE orders (
  order_id VARCHAR(10) PRIMARY KEY,
  login_id VARCHAR(50) NOT NULL,
  total_price INT NOT NULL,
  receiver_name VARCHAR(20) NOT NULL,
  address VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_detail VARCHAR(200) DEFAULT NULL,
  delivery_request VARCHAR(200) DEFAULT NULL,
  status TINYINT DEFAULT 1, /* 0=注文キャンセル, 1=注文完了（準備中）, 2=配送中, 3=配送完了 */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (login_id) REFERENCES users(login_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 注文明細
CREATE TABLE order_items (
  order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(10) NOT NULL,
  product_id VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- お知らせ (ID：NT1 形式。status 0=表示中, 1=非表示で論理削除)
CREATE TABLE notices (
  notice_id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_pinned TINYINT DEFAULT 0, /* 0=未固定, 1=固定 */
  login_id VARCHAR(50) DEFAULT NULL,
  status TINYINT DEFAULT 0, /* 0=表示中, 1=非表示 */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notice_user FOREIGN KEY (login_id) REFERENCES users(login_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- お知らせ画像
CREATE TABLE notice_images (
  image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(10) NOT NULL,
  role TINYINT DEFAULT 2,
  image_url VARCHAR(255) NOT NULL,
  image_order INT DEFAULT 1,
  CONSTRAINT fk_notice_image_notice FOREIGN KEY (notice_id) REFERENCES notices(notice_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベント (ID：EV1 形式。status 0=表示中, 1=非表示で論理削除)
CREATE TABLE events (
  event_id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_pinned TINYINT DEFAULT 0, /* 0=未固定, 1=固定 */
  login_id VARCHAR(50) DEFAULT NULL,
  status TINYINT DEFAULT 0, /* 0=表示中, 1=非表示 */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (login_id) REFERENCES users(login_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベント画像
CREATE TABLE event_images (
  image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(10) NOT NULL,
  role TINYINT DEFAULT 2,
  image_url VARCHAR(255) NOT NULL,
  image_order INT DEFAULT 1,
  CONSTRAINT fk_event_image_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (category_id, name) VALUES 
(1, '冷房製品'), (2, '空調'), (3, 'キッチン家電'), (4, '洗濯'), (5, '小型生活家電'),
(6, 'テレビ・映像'), (7, 'PC製品'), (8, 'IT周辺機器'), (9, 'モバイル'), (10, '音響');
