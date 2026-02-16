import * as orderModel from "../models/order.model.js";
import db from "../config/db.js";

// 주문 생성
export const createOrder = async (req, res) => {
  try {
    const { login_id, items, total_price, receiver_name, address, address_detail, 
            phone, delivery_request } = req.body;
    if (!login_id || !Array.isArray(items) || items.length === 0 || !receiver_name || !address || !phone) {
      return res.status(400).json({ success: false, message: "필수 정보 누락" });
    }

    // 1. 주문 생성
    const order_id = await orderModel.createOrder(
      login_id,
      total_price,
      receiver_name, //계정주인의 이름x 수령인 이름o
      address,
      phone,
      address_detail,
      delivery_request
    );
    
    // 2. 주문 상품 등록 및 재고 차감 (1,2가 한 트랜잭션)
    for (const item of items) {
      await orderModel.createOrderItem(order_id, item.product_id, item.quantity, item.price);
      // 재고 차감
      await db.query(
        "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity]
      );
    }
    res.status(201).json({ success: true, order_id });
  } catch (err) {
    console.error("주문 생성 에러:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 주문 상세 조회
export const getOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await orderModel.getOrderWithItems(order_id);
    if (!order) return res.status(404).json({ success: false, message: "주문 없음" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("주문 상세 조회 에러:", err);
  }
};

// 유저별 주문 목록
export const getOrdersByUser = async (req, res) => {
  try {
    const { login_id } = req.params;
    const orders = await orderModel.getOrdersByUser(login_id);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};
