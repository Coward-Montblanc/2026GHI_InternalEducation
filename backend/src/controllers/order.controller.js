import * as orderModel from "../models/order.model.js";
import db from "../config/db.js";
import response from "../utils/response.js";

// 주문 생성 (본인만 주문 가능)
export const createOrder = async (req, res) => {
  try {
    const { login_id, items, total_price, receiver_name, address, address_detail,
            phone, delivery_request } = req.body;
    if (!login_id || !Array.isArray(items) || items.length === 0 || !receiver_name || !address || !phone) {
      return response.error(res , "必要な情報が不足しています。" , 400);
    }
    if (req.user?.login_id !== login_id) {
      return response.error(res , "本人の注文のみ実行できます。" , 403);
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
      // 주문 전, 재고 확인
      const [stockRows] = await db.query(
        "SELECT stock FROM products WHERE product_id = ?",
        [item.product_id]
      );
      const stock = stockRows[0]?.stock ?? null;
      if (stock === null || stock < item.quantity || stock === 0) {
        return response.error(res , `商品ID ${item.product_id}の在庫が不足しています。` , 400);
      }
      await orderModel.createOrderItem(order_id, item.product_id, item.quantity, item.price);

      // 재고 차감 (동시에 주문이 들어오거나 재고가 부족한 경우를 대비하여, 재고가 충분한 경우에만 차감하도록 조건 추가)
      const [updateResult] = await db.query(
        "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity]
      );
      if (updateResult.affectedRows === 0) {
        return response.error(res , `商品ID ${item.product_id}の在庫が不足しているため、注文に失敗しました。` , 400);
      }

      //재고 차감으로인해 재고수가 0으로 바뀌었을 때 스테이터스를 바꿈
      await db.query(
        "UPDATE products SET status = 2 WHERE product_id = ? AND stock = 0 AND status = 0",
        [item.product_id]
      );
    }
    return response.success(res, { order_id }, 201); 
  } catch (err) {
    console.error("注文作成エラー:", err);
    return response.error(res , "サーバーエラーが発生しました。" , 500);
  }
};

// 주문 상세 조회 본인 주문이 아니면 볼 수 없도록 방어
export const getOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const orderData = await orderModel.getOrderWithItems(order_id);
    const orderRow = orderData?.order;
    const items = orderData?.items;
    if (!orderRow || !items || items.length === 0) {
      return response.error(res , "注文が存在しません。" , 404);
    }
    // 본인 주문이 아니면 403 (관리자 제외)
    if (req.user.role !== "ADMIN" && orderRow.login_id !== req.user.login_id) {
      return response.error(res , "この注文を閲覧する権限がありません。" , 403);
    }
    res.json({ success: true, order: { order: orderRow, items } });
  } catch (err) {
    console.error("주문 상세 조회 에러:", err);
    return response.error(res , "サーバーエラーが発生しました。" , 500);
  }
};

// 유저별 주문 목록 (방어2)
export const getOrdersByUser = async (req, res) => {
  try {
    const { login_id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.login_id !== login_id) {
      return response.error(res , "他のユーザーの注文履歴は閲覧できません。" , 403);
    }
    const orders = await orderModel.getOrdersByUser(login_id);
    res.json({ success: true, orders });
  } catch (err) {
    return response.error(res , "サーバーエラーが発生しました。" , 500);
  }
};
