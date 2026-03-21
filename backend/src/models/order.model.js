import db from "../config/db.js";
import * as productModel from "../models/product.model.js"; //판매시 상품 판매량 증가, 상품 이미지를 위한 임포트
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
    `SELECT oi.*, p.name AS product_name, pi.image_url 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.role = 1
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

// 주문 상태 및 판매량 업데이트
export const updateOrderAdmin = async (connection, orderId, updateData) => {
  const { status: newStatus, receiver_name, address, address_detail, phone, delivery_request } = updateData;

  const [[order]] = await connection.execute(
    "SELECT status FROM orders WHERE order_id = ?",
    [orderId]
  );
  
  if (!order) throw new Error("注文が存在しません。");

  const oldStatus = Number(order.status); //주문을 정상적으로 가져오면 상태를 가져옴.
  const targetStatus = Number(newStatus);

  if (oldStatus !== targetStatus) { //판매가 완료될 경우 재고 업데이트
    const [items] = await connection.execute(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [orderId]
    );

    const DELIVERY_COMPLETED = 3; //배송 완료

    for (const item of items) {
      if (targetStatus === DELIVERY_COMPLETED) { //배송완료 될경우 판매량 업데이트
        await productModel.incrementSalesCount(item.product_id, item.quantity);
      } else if (oldStatus === DELIVERY_COMPLETED && newStatus !== DELIVERY_COMPLETED) { 
        await productModel.incrementSalesCount(item.product_id, -item.quantity);
      }

      if (targetStatus === 0 && oldStatus !== 0) { //환불, 반품 등 취소되었을 경우 재고 업데이트
        await connection.execute(
          "UPDATE products SET stock = stock + ? WHERE product_id = ?",
          [item.quantity, item.product_id]
        );

        await connection.execute( //취소로 품절인 상품 재고가 살아날 경우 판매중으로 바꿔줌
          "UPDATE products SET status = 0 WHERE product_id = ? AND status = 2",
          [item.product_id]
        );
      }
      else if (oldStatus === 0 && targetStatus !== 0) { 
        await connection.execute(
          "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
          [item.quantity, item.product_id, item.quantity]
        );
      }
    }
  }

  //주문상태 업데이트
  const [result] = await connection.execute(
    `UPDATE orders 
     SET status = ?, receiver_name = ?, address = ?, address_detail = ?, 
         phone = ?, delivery_request = ?
     WHERE order_id = ?`,
    [targetStatus, receiver_name, address, address_detail, phone, delivery_request, orderId]
  );
  
  return result.affectedRows;
};