import db from "../config/db.js";

// 주문"만" 생성
export const createOrder = async (login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status = 'ORDERED') => {
  const [result] = await db.query(
    `
    INSERT INTO orders 
    (login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status)
    VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [login_id, total_price, receiver_name, address, phone, address_detail, delivery_request, status]
  );
  return result.insertId;
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

// 주문 상세 조회 (order + order_items)
export const getOrderWithItems = async (order_id) => {
  const [[order]] = await db.query(`SELECT * FROM orders WHERE order_id = ?`, [order_id]);
  const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order_id]);
  return {order, items};
};

// 유저별 주문 목록 조회
export const getOrdersByUser = async (login_id) => {
  const [orders] = await db.query(`SELECT * FROM orders WHERE login_id = ? ORDER BY created_at DESC`, [login_id]);
  return orders;
};
