import db from "../config/db.js";
import { buildDynamicQuery } from '../utils/queryBuilder.js';

export const findOrdersAdmin = async (filters) => {
    const { limit, offset, ...searchFilters } = filters;
    const baseSql = `
        SELECT 
            order_id, login_id, total_price, receiver_name, 
            address, phone, address_detail, delivery_request, 
            status, created_at 
        FROM orders
    `;

    const options = {
        order_id: 'LIKE',
        login_id: 'LIKE',
        receiver_name: 'LIKE',
        created_at: 'BETWEEN'
    };
    
    const { sql, params } = buildDynamicQuery(baseSql, searchFilters, options);
    
    const { sql: countSql, params: countParams } = buildDynamicQuery(
        "SELECT COUNT(*) as total FROM orders", 
        searchFilters, 
        options
    );

    //조립 유틸 함수로 넘김
    const finalSql = `${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const finalParams = [ ...params, Number(limit), Number(offset) ];
    
    const [rows] = await db.query(finalSql, finalParams);
    const [countResult] = await db.execute(countSql, countParams);
    
    return {
        rows,
        totalCount: countResult[0].total
    };
};

// 주문"만" 생성
//BIGINT AUTO_INCREMENT방식을 쓰면 DB에 CT1 이런 방식이 아니라 1 이렇게만 들어감. max +1방식으로 변경
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

// 이제 그 주문에 여러 상품을 등록
// 한 트랜잭션에서 주문과 주문상품이 함께 처리되지만, 선행되는 건 주문(createOrder)입니다. 
// 주문이 먼저 생성되어야 그 주문 ID를 받아서 주문상품(createOrderItem)을 등록할 수 있습니다.
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

// 주문 상세 조회 (order + order_items, 상품명 포함)
export const getOrderWithItems = async (order_id) => {
  const [[order]] = await db.query(`SELECT * FROM orders WHERE order_id = ?`, [order_id]);
  const [items] = await db.query(
    `SELECT oi.*, p.name AS product_name,
     (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) AS image_url
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.product_id
     WHERE oi.order_id = ?`,
    [order_id]
  );
  return { order, items: items || [] };
};

// 유저별 주문 목록 조회
export const getOrdersByUser = async (login_id) => {
  const [orders] = await db.query(`SELECT * FROM orders WHERE login_id = ? ORDER BY created_at DESC`, [login_id]);
  return orders;
};
