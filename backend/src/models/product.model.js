import db from "../config/db.js";
import { buildDynamicQuery } from "../utils/queryBuilder.js";

export async function findProducts(filters) {
    const { limit, offset, sortField = 'p.created_at', sortOrder = 'DESC', ...searchFilters } = filters;

    const baseSql = `
        SELECT p.*, 
               c.name as category_name, 
               (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as main_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
    `;

    const countBase = "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.category_id";

    const options = {
        "p.product_id": 'LIKE',
        "p.name": 'LIKE',       
        "c.name": 'LIKE',
        "p.status": '=',
        "p.created_at": 'BETWEEN', 
        "p.price": 'BETWEEN',      
        "p.stock": 'BETWEEN',      
        "p.is_recommended": '=',
        "p.view": 'BETWEEN',
        "p.sales_count": 'BETWEEN'
    };

    const mappedFilters = {};
    if (searchFilters.product_id) mappedFilters["p.product_id"] = searchFilters.product_id;
    if (searchFilters.name) mappedFilters["p.name"] = searchFilters.name;
    if (searchFilters.category_id) mappedFilters["c.name"] = searchFilters.category_id;
    if (searchFilters.status !== undefined && searchFilters.status !== "all") {
      mappedFilters["p.status"] = Number(searchFilters.status);
    }
    if (searchFilters.is_recommended !== undefined && searchFilters.is_recommended !== "" && searchFilters.is_recommended !== "all") {
      mappedFilters["p.is_recommended"] = Number(searchFilters.is_recommended);
    }

    const processRange = (key, min, max, originalArray) => {
        if (originalArray && Array.isArray(originalArray)) return originalArray;
        if (min !== undefined || max !== undefined) {
            return [min ? Number(min) : 0, max ? Number(max) : 9999999];
        }
        return null;
    };

    const viewRange = processRange("view", searchFilters.minView, searchFilters.maxView, searchFilters.view);
    if (viewRange) mappedFilters["p.view"] = viewRange;

    const salesRange = processRange("sales", searchFilters.minSales, searchFilters.maxSales, searchFilters.sales_count);
    if (salesRange) mappedFilters["p.sales_count"] = salesRange;

    const priceRange = processRange("price", searchFilters.minPrice, searchFilters.maxPrice, searchFilters.price);
    if (priceRange) mappedFilters["p.price"] = priceRange;

    const stockRange = processRange("stock", searchFilters.minStock, searchFilters.maxStock, searchFilters.stock);
    if (stockRange) mappedFilters["p.stock"] = stockRange;

    if (searchFilters.created_at) mappedFilters["p.created_at"] = searchFilters.created_at;

    const { sql, params } = buildDynamicQuery(baseSql, mappedFilters, options); 
    
    const { sql: countSql, params: countParams } = buildDynamicQuery(countBase, mappedFilters, options);
    
    const allowedSortFields = {
        product_id: "CAST(REPLACE(p.product_id, 'PD', '') AS UNSIGNED)",
        price: 'p.price',
        stock: 'p.stock',
        view: 'p.view',
        sales_count: 'p.sales_count',
        created_at: 'p.created_at'
    };
    
    const finalSortField = allowedSortFields[sortField] || 'p.created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const finalSql = `${sql} ORDER BY ${finalSortField} ${finalSortOrder} LIMIT ? OFFSET ?`;
    const finalParams = [...params, Number(limit), Number(offset)];
    const [rows] = await db.query(finalSql, finalParams);
    
    const [countResult] = await db.execute(countSql, countParams);

    return {
        products: rows,
        totalCount: countResult[0].total || 0
    };
}

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

//商品が売れたら（注文の配送完了状態）販売数量更新される関数
export const incrementSalesCount = async (productId, quantity) => { 
  await db.query(
    "UPDATE products SET sales_count = sales_count + ? WHERE product_id = ?",
    [quantity, productId]
  );
};

//商品詳細照会時のビュー増加
export const incrementView = async (productId) => {
  await db.query("UPDATE products SET view = view + 1 WHERE product_id = ?", [productId]);
};

//すべての商品を見る（販売中の商品のみ）

export const getAllProducts = async (page = 1, limit = 24, search = "") => {
  const offset = (page - 1) * limit;

  // searchパラメータの追加
  const searchCond = search && search.trim() !== "" ? `AND p.name LIKE ?` : ""; // 타이틀에서만 검색
  const searchValue = search && search.trim() !== "" ? `%${search}%` : null;

  // 全商品数の照会(検索語を含む)
  const countQuery = `SELECT COUNT(*) as total FROM products p WHERE p.status IN (0, 2) ${searchCond}`;
  const countParams = searchCond ? [searchValue] : []; 
  const [countRows] = await db.query(countQuery, countParams);
  const total = countRows[0].total;

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

export const getProductsByCategory = async (categoryId, search = "") => {
  const searchCond = search && search.trim() !== "" ? `AND p.name LIKE ?` : "";
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

export const updateProduct = async (productId, productData, connection = null) => {
  const { category_id, name, description, price, stock, is_recommended = 0, status: reqStatus } = productData;
  let status = Number(productData.status);
  if (Number(stock) === 0) status = 2;
  const executor = connection || db;

  const [result] = await executor.query(
    `UPDATE products 
     SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, status = ?, is_recommended = ? 
     WHERE product_id = ?`,
    [category_id, name, description, price, stock, status, is_recommended, productId]
  );

  return result;
};

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

export const bulkUpdateStatus = async (ids, status) => {
  try {
    const [result] = await db.query(
      `UPDATE products SET status = ? WHERE product_id IN (?)`,
      [status, ids]
    );

    return result.affectedRows;
  } catch (error) {
    console.error("商品修正エラーが発生しました。:", error);
    throw error;
  }
};

export const softDeleteProduct = async (productId) => {
  const [result] = await db.query(
    `UPDATE products SET status = 1 WHERE product_id = ?`,
    [productId]
  );
  return result.affectedRows;
};

export const createProductImage = async (productId, imageUrl, role, order) => {
  const [result] = await db.query(
    `INSERT INTO product_images (product_id, image_url, role, image_order) 
     VALUES (?, ?, ?, ?)`,
    [productId, imageUrl, role, order]
  );
  return result.insertId;
};

