import db from "../config/db.js";
import { buildDynamicQuery } from "../utils/queryBuilder.js";

export async function findProducts(filters) {
    const { limit, offset, ...searchFilters } = filters;

    const baseSql = `
        SELECT p.*, 
               c.name as category_name, 
               (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
    `;

    const options = {
        "p.product_id": 'LIKE',
        "p.name": 'LIKE',       
        "p.category_id": '=',
        "p.status": '=',
        "p.created_at": 'BETWEEN'
    };

    const mappedFilters = {};
    if (searchFilters.product_id) mappedFilters["p.product_id"] = searchFilters.product_id;
    if (searchFilters.name) mappedFilters["p.name"] = searchFilters.name;
    if (searchFilters.category_id) mappedFilters["p.category_id"] = searchFilters.category_id;
    if (searchFilters.status !== undefined) mappedFilters["p.status"] = searchFilters.status;
    if (searchFilters.created_at) mappedFilters["p.created_at"] = searchFilters.created_at;

    const { sql, params } = buildDynamicQuery(baseSql, mappedFilters, options); 
    
    const { sql: countSql, params: countParams } = buildDynamicQuery( 
        "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.category_id", 
        mappedFilters, 
        options
    );
    //조립 유틸 함수로 넘김
    const finalSql = `${sql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const finalParams = [...params, Number(limit), Number(offset)];

    const [rows] = await db.query(finalSql, finalParams);
    const [countResult] = await db.execute(countSql, countParams);

    return {
        products: rows,
        totalCount: countResult[0].total
    };
}

  // 인기상품 조회 (view 30 이상)
  //role1을 메인이미지로 두도록 변경
  // 추천상품 기준 (조회수 + 판매량 * 10)
  // 추천상품 점수 변수로 저장할지 로직만으로 끝낼지 고민중.
export const getRankProducts = async () => {
  const [rows] = await db.query(
    `SELECT p.*,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image,
      ((p.view * 1) + (p.sales_count * 10)) AS popularity_score
     FROM products p
     WHERE p.status = 0
     ORDER BY p.is_recommended DESC, popularity_score DESC
     LIMIT 10`
  );
  return rows;
};

//상품이 팔리면(주문의 배송완료 상태) 판매수량 업데이트되는 함수
export const incrementSalesCount = async (productId, quantity) => { 
  await db.query(
    "UPDATE products SET sales_count = sales_count + ? WHERE product_id = ?",
    [quantity, productId]
  );
};

  // 상품 상세 조회 시 view 증가
export const incrementView = async (productId) => {
  await db.query("UPDATE products SET view = view + 1 WHERE product_id = ?", [productId]);
};

  // 모든 상품 조회 (판매 중인 상품만)

export const getAllProducts = async (page = 1, limit = 24, search = "") => {
  const offset = (page - 1) * limit;

  // search 파라미터 추가
  const searchCond = search && search.trim() !== "" ? `AND p.name LIKE ?` : ""; // 타이틀에서만 검색
  const searchValue = search && search.trim() !== "" ? `%${search}%` : null;

  // 전체 상품 개수 조회 (검색어 포함)
  // 일시품절상품도 표시는 되지만 구매버튼 막아둠
  const countQuery = `SELECT COUNT(*) as total FROM products p WHERE p.status IN (0, 2) ${searchCond}`;
  const countParams = searchCond ? [searchValue] : []; 
  const [countRows] = await db.query(countQuery, countParams);
  const total = countRows[0].total;

  // 페이지별 상품 조회 (검색어 포함)
  const query = `
    SELECT 
      p.product_id, p.name, p.description, p.price, p.stock, p.status, p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.status IN (0, 2) ${searchCond}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const params = searchCond ? [searchValue, limit, offset] : [limit, offset];
  const [rows] = await db.query(query, params);

  return {
    products: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total,
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
export const getProductsByCategory = async (categoryId, search = "") => {
  // search 파라미터 추가
  const searchCond = search && search.trim() !== "" ? `AND p.name LIKE ?` : ""; //서치시 타이틀에서만 검색
  const searchValue = search && search.trim() !== "" ? `%${search}%` : null;
  const query = `
    SELECT 
      p.product_id, p.name, p.description, p.price, p.stock, p.status, p.created_at,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.category_id = ? AND p.status IN (0, 2) ${searchCond}
    ORDER BY p.created_at DESC
  `;
  const params = searchCond ? [categoryId, searchValue] : [categoryId];
  const [rows] = await db.query(query, params);
  return rows;
};

// 상품 생성 (InsertId 반환)
//BIGINT AUTO_INCREMENT방식을 쓰면 DB에 CT1 이런 방식이 아니라 1 이렇게만 들어감. max +1방식으로 변경
export const createProduct = async (connection, productData) => {
  const { category_id, name, description, price, stock, is_recommended = 0 } = productData;
  let status = Number(productData.status ?? 0);
  if (Number(stock) === 0) status = 2;
  const [[rows]] = await connection.execute(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(product_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM products"
  );
  const product_id = `PD${rows.n}`;
  await connection.execute(
    "INSERT INTO products (product_id, category_id, name, description, price, stock, status, is_recommended) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [product_id, category_id, name, description, price, stock, status, is_recommended]
  );
  return product_id;
};

// 관리자용 전체 상품 조회 (status 필터 없음)
export const getAllProductsForAdmin = async (page = 1, limit = 24, search = "") => {
  const offset = (Number(page) - 1) * Number(limit);
  const searchCond = search && search.trim() !== "" ? `AND p.name LIKE ?` : "";
  const searchValue = search && search.trim() !== "" ? `%${search}%` : null;

  const countQuery = `SELECT COUNT(*) as total FROM products p WHERE 1=1 ${searchCond}`;
  const countParams = searchCond ? [searchValue] : [];
  const [countRows] = await db.query(countQuery, countParams);
  const total = countRows[0].total;

  const query = `
    SELECT 
      p.product_id, p.name, p.description, p.price, p.stock, p.status, p.created_at, p.view, p.sales_count, p.is_recommended,
      c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE 1=1 ${searchCond}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const params = searchCond ? [searchValue, Number(limit), offset] : [Number(limit), offset];
  const [rows] = await db.query(query, params);

  return {
    products: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 상품 정보 수정
export const updateProduct = async (productId, productData) => {
  const { category_id, name, description, price, stock, is_recommended, status: reqStatus } = productData;
  let status = Number(productData.status);
  //재고가 0인 상태에서 판매중 상태로 둬도 자동으로 품절로 뜨도록
  if (Number(stock) === 0) status = 2;
  const [result] = await db.query(
    `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, status = ?, is_recommended = ? WHERE product_id = ?`,
    [category_id, name, description, price, stock, status, is_recommended, productId]
  );
  return result.affectedRows;
};

// 추천 상태 업데이트 함수
export const updateRecommendStatus = async (productId, is_recommended) => {
  try {
    const [result] = await db.query(
      "UPDATE products SET is_recommended = ? WHERE product_id = ?",
      [is_recommended, productId]
    );

    return result.affectedRows;
  } catch (error) {
    console.error("商品修正エラーが発生しました。:", error);
    throw error;
  }
};

// [추가] 논리적 삭제 (Soft Delete): 상태만 변경
export const softDeleteProduct = async (productId) => {
  const [result] = await db.query(
    `UPDATE products SET status = 1 WHERE product_id = ?`,
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

