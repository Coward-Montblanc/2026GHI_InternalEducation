import db from "../config/db.js";

// 모든 상품 조회 (판매 중인 상품만)
export const getAllProducts = async (page = 1, limit = 24) => {
  const offset = (page - 1) * limit;
  
  // 1. 전체 상품 개수 조회 (status=0인 것만)
  const [countRows] = await db.query(
    'SELECT COUNT(*) as total FROM products WHERE status = 0'
  );
  
  // 💡 중요: countRows[0].total 로 접근해야 합니다.
  const total = countRows[0].total; 
  
  // 2. 페이지별 상품 조회
  const [rows] = await db.query(
    `
    SELECT 
      p.product_id, p.name, p.description, p.price, p.stock, p.status, p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 'MAIN' LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.status = 0
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [limit, offset]
  );
  
  return {
    products: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total, // 이제 여기서 total이 정의되어 에러가 나지 않습니다.
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 상품 ID로 상세 조회 (상세 페이지는 status 상관없이 조회 가능하게 유지)
export const getProductById = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT p.*, c.name as category_name, c.category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.product_id = ?
  `,
    [productId]
  );

  if (rows.length === 0) return null;

  const [images] = await db.query(
    `SELECT image_id, role, image_url, image_order FROM product_images WHERE product_id = ? ORDER BY image_order`,
    [productId]
  );

  return { ...rows[0], images };
};

// 카테고리별 상품 조회 (판매 중인 것만)
export const getProductsByCategory = async (categoryId) => {
  const [rows] = await db.query(
    `
    SELECT 
      p.product_id, p.name, p.description, p.price, p.stock, p.status, p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 'MAIN' LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.category_id = ? AND p.status = 0
    ORDER BY p.created_at DESC
  `,
    [categoryId]
  );
  return rows;
};

// 상품 생성 (InsertId 반환)
export const createProduct = async (productData) => {
  const { category_id, name, description, price, stock, status = 0 } = productData;
  const [result] = await db.query(
    `INSERT INTO products (category_id, name, description, price, stock, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [category_id, name, description, price, stock, status]
  );
  return result.insertId;
};

// 상품 정보 수정
export const updateProduct = async (productId, productData) => {
  const { category_id, name, description, price, stock, status } = productData;
  const [result] = await db.query(
    `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, status = ? WHERE product_id = ?`,
    [category_id, name, description, price, stock, status, productId]
  );
  return result.affectedRows;
};

// [추가] 논리적 삭제 (Soft Delete): 상태만 변경
export const softDeleteProduct = async (productId) => {
  const [result] = await db.query(
    `UPDATE products SET status = 1 WHERE product_id = ?`,
    [productId]
  );
  return result.affectedRows;
};

// 물리적 삭제 (Hard Delete): 실제 데이터 삭제
export const deleteProduct = async (productId) => {
  const [result] = await db.query(
    `DELETE FROM products WHERE product_id = ?`,
    [productId]
  );
  return result.affectedRows;
};

//상품 이미지 저장 함수
export const createProductImage = async (productId, imageUrl, role, order) => {
  const [result] = await db.query(
    `INSERT INTO product_images (product_id, image_url, role, image_order) 
     VALUES (?, ?, ?, ?)`,
    [productId, imageUrl, role, order]
  );
  return result.insertId;
};