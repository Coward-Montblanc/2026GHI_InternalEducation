import db from "../config/db.js";
import * as productModel from "../models/product.model.js";
import { buildDynamicQuery } from '../utils/queryBuilder.js';

export const findOrdersAdmin = async (filters) => {
    const { limit, offset, sortField = 'created_at', sortOrder = 'DESC', 
        startDate, endDate, startUpdateDate, endUpdateDate, minPrice,
        maxPrice, ...searchFilters } = filters;
    const baseSql = `
        SELECT 
            order_id, login_id, total_price, receiver_name, 
            address, phone, address_detail, delivery_request, 
            status, created_at, updated_at
        FROM orders
    `;

    const options = {
        order_id: 'LIKE',
        login_id: 'LIKE',
        receiver_name: 'LIKE',
        address: 'LIKE',   
        phone: 'LIKE',       
        searchTerm: 'LIKE',   
        status: '=',          
        total_price: 'BETWEEN',
        created_at: 'BETWEEN',
        updated_at: 'BETWEEN'
    };

    if (startDate && endDate) searchFilters.created_at = [startDate, endDate];
    if (startUpdateDate && endUpdateDate) searchFilters.updated_at = [startUpdateDate, endUpdateDate];
    if (minPrice || maxPrice) {
        searchFilters.total_price = [
            minPrice !== "" && minPrice !== undefined ? Number(minPrice) : 0, 
            maxPrice !== "" && maxPrice !== undefined ? Number(maxPrice) : 99999999
        ];
    }

    const { sql, params } = buildDynamicQuery(baseSql, searchFilters, options);
    

    const { sql: countSql, params: countParams } = buildDynamicQuery(
        "SELECT COUNT(*) as total FROM orders", 
        searchFilters, 
        options
    );

    const allowedSortFields = {
        order_id: "CAST(REPLACE(order_id, 'OD', '') AS UNSIGNED)", 
        total_price: 'total_price',
        created_at: 'created_at',
        updated_at: 'updated_at',
        login_id: 'login_id'
    };

    const finalSortField = allowedSortFields[sortField] || 'created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const finalSql = `${sql} ORDER BY ${finalSortField} ${finalSortOrder} LIMIT ? OFFSET ?`;
    const finalParams = [ ...params, Number(limit), Number(offset) ];
    
    const [rows] = await db.query(finalSql, finalParams);
    const [countResult] = await db.execute(countSql, countParams);
    
    return {
        rows,
        totalCount: countResult[0].total
    };
};

//注文「のみ」を生成
export const createOrder = async (login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status = 1) => {
  const [[rows]] = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM orders"
  );
  const order_id = `OD${rows.n}`;
  await db.query(
    "INSERT INTO orders (order_id, login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [order_id, login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status]
  );
  return order_id;
};

export const createOrderItem = async (order_id, product_id, quantity, price) => {
  await db.query(
    `
    INSERT INTO order_items 
    (order_id, product_id, quantity, price) 
    VALUES 
    (?, ?, ?, ?)
    `,
    [order_id, product_id, quantity, price]
  );
};

//注文詳細照会（order + order_items、商品名を含む）
export const getOrderWithItems = async (order_id) => {
  const [[order]] = await db.query(`SELECT * FROM orders WHERE order_id = ?`, [order_id]);
  const [items] = await db.query(
    `SELECT oi.*, p.name AS product_name, pi.image_url 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.role = 1
    WHERE oi.order_id = ?`,
    [order_id]
  );
  return { order, items: items || [] };
};

// ユーザー別注文リストの照会
export const getOrdersByUser = async (login_id) => {
  const [orders] = await db.query(`SELECT * FROM orders WHERE login_id = ? ORDER BY created_at DESC`, [login_id]);
  return orders;
};

//在庫調整
const adjustProductStock = async (connection, productId, quantity) => { 
  await connection.execute(
    "UPDATE products SET stock = stock + ? WHERE product_id = ?",
    [quantity, productId]
  );
  
  await connection.execute(
    "UPDATE products SET status = 0 WHERE product_id = ? AND status = 2 AND stock > 0",
    [productId]
  );
};

//注文ステータス確認後の在庫調整
const OrderStatusChange = async (connection, orderId, oldStatus, newStatus) => {
  if (oldStatus === newStatus) return;

  const [items] = await connection.execute(
    "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
    [orderId]
  );

  const DELIVERY_COMPLETED = 3;
  const CANCELED = 0;

  for (const item of items) {
    if (newStatus === DELIVERY_COMPLETED) { //配送完了状態の場合、在庫分だけ販売量増加
      await productModel.incrementSalesCount(item.product_id, item.quantity);
    } else if (oldStatus === DELIVERY_COMPLETED) {
      await productModel.incrementSalesCount(item.product_id, -item.quantity);
    }

    if (newStatus === CANCELED) { //注文がキャンセルされた場合、在庫数だけ販売量が減少
      await adjustProductStock(connection, item.product_id, item.quantity); // 在庫調整
    } else if (oldStatus === CANCELED) {
      await adjustProductStock(connection, item.product_id, -item.quantity); // 在庫調整
    }
  }
};

//注文ステータス更新関数
export const updateOrderAdmin = async (connection, orderId, updateData) => {
  const { status: newStatus, receiver_name, address, address_detail, phone, delivery_request } = updateData;

  const [[order]] = await connection.execute("SELECT status FROM orders WHERE order_id = ?", [orderId]);
  if (!order) throw new Error("注文が存在しません。");

  //注文ステータス確認後の在庫調整
  await OrderStatusChange(connection, orderId, Number(order.status), Number(newStatus)); 

  const [result] = await connection.execute(
    `UPDATE orders 
     SET status = ?, receiver_name = ?, address = ?, address_detail = ?, 
         phone = ?, delivery_request = ?, updated_at = NOW()
     WHERE order_id = ?`,
    [newStatus, receiver_name, address, address_detail, phone, delivery_request, orderId]
  );
  
  return result.affectedRows;
};

//販売量の推移
export const getSalesTrend = async () => {
  const sql = `
    SELECT 
      DATE_FORMAT(updated_at, '%Y-%m-%d') AS date,
      COUNT(order_id) AS daily_orders,
      CAST(SUM(total_price) AS UNSIGNED) AS daily_revenue
    FROM orders
    WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND status = 3
    GROUP BY DATE_FORMAT(updated_at, '%Y-%m-%d')
    ORDER BY date ASC
  `;
  
  const [rows] = await db.query(sql);
  return rows;
};
