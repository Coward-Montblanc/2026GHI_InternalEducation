import db from "../config/db.js";

// 모든 상품 조회 (페이지네이션)
export const getAllProducts = async (page = 1, limit = 24) => {
  const offset = (page - 1) * limit;
  
  // 전체 상품 개수 조회
  const [countResult] = await db.query(
    'SELECT COUNT(*) as total FROM products'
  );
  const total = countResult[0].total;
  
  // 페이지별 상품 조회
  const [rows] = await db.query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.status,
      p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 'MAIN' LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [limit, offset]
  );
  
  return {
    products: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 상품 ID로 상세 조회
export const getProductById = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.status,
      p.created_at,
      c.name as category_name,
      c.category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.product_id = ?
  `,
    [productId]
  );

  if (rows.length === 0) {
    return null;
  }

  // 상품 이미지들 가져오기 (role 포함)
  const [images] = await db.query(
    `
    SELECT image_id, role, image_url, image_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY image_order
  `,
    [productId]
  );

  return {
    ...rows[0],
    images: images,
  };
};

// 카테고리별 상품 조회
export const getProductsByCategory = async (categoryId) => {
  const [rows] = await db.query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.status,
      p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 'MAIN' LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.category_id = ?
    ORDER BY p.created_at DESC
  `,
    [categoryId]
  );
  return rows;
};

// 상품 생성
export const createProduct = async (productData) => {
  const { category_id, name, description, price, stock, status = 0 } =
    productData;
  const [result] = await db.query(
    `
    INSERT INTO products (category_id, name, description, price, stock, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [category_id, name, description, price, stock, status]
  );
  return result.insertId;
};

// 상품 수정
export const updateProduct = async (productId, productData) => {
  const { category_id, name, description, price, stock, status } =
    productData;
  const [result] = await db.query(
    `
    UPDATE products
    SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, status = ?
    WHERE product_id = ?
  `,
    [category_id, name, description, price, stock, status, productId]
  );
  return result.affectedRows;
};

// 상품 삭제
export const deleteProduct = async (productId) => {
  const [result] = await db.query(
    `
    DELETE FROM products WHERE product_id = ?
  `,
    [productId]
  );
  return result.affectedRows;
};