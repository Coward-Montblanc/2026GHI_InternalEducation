import * as orderModel from "../models/order.model.js";
import db from "../config/db.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES } from "../config/constants.js";

export const getAdminOrders = async (req, res) => { //管理者ページ注文管理リスト
  try {
    
    const { 
      status, order_id, login_id, receiver_name, searchTerm, address, phone, minPrice, maxPrice,
      startDate, endDate, startUpdateDate, endUpdateDate, sortField, sortOrder 
    } = req.query;
    
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const filters = {
      status, order_id, login_id, receiver_name, searchTerm,
      address, phone, minPrice, maxPrice,
      startDate, endDate, startUpdateDate, endUpdateDate,
      offset: parseInt(offset),
      limit: parseInt(limit),
      sortField: sortField || 'created_at',
      sortOrder: sortOrder || 'DESC'
    };

    const { rows : orders, totalCount } = await orderModel.findOrdersAdmin(filters);

    const totalPages = Math.ceil(totalCount / limit);

    return response.success(res,{ 
      orders, 
      pagination: { 
        totalItems: totalCount, 
        totalPages, 
        currentPage: parseInt(page) 
        } 
      }, RESPONSE_MESSAGES.SUCCESS.DEFAULT
    );
  } catch (error) {
    console.error("Admin Order Error:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const getOrderDetailAdmin = async (req, res) => { //管理者ページ注文詳細ページ
  try {
    const { orderId } = req.params;
    const { order, items } = await orderModel.getOrderWithItems(orderId);

    if (!order) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }

    return response.success(res, {order, items}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    console.error("管理者注文詳細エラー", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const patchOrderStatusAdmin = async (req, res) => {
  const { orderId } = req.params;
  const updateData = req.body;
  
  const connection = await db.getConnection(); //トランザクションを追加
  try {
    await connection.beginTransaction(); //トランザクションの開始

    const affectedRows = await orderModel.updateOrderAdmin(connection, orderId, updateData);

    if (affectedRows === 0) {
      await connection.rollback();
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }

    await connection.commit(); //トランザクションの終了
    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    await connection.rollback();
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  } finally {
    connection.release();
  }
};

// オーダー作成(本人のみオーダー可能)
export const createOrder = async (req, res) => {
  const connection = await db.getConnection(); //トランザクションを追加
  try {
    const { login_id, items, total_price, receiver_name, address, address_detail,
            phone, delivery_request } = req.body;
    if (!login_id || !Array.isArray(items) || items.length === 0 || !receiver_name || !address || !phone) {
      return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
    }
    if (req.user?.login_id !== login_id) {
      return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }

    await connection.beginTransaction(); //トランザクションの開始

    const order_id = await orderModel.createOrder(
      login_id,
      total_price,
      receiver_name,
      address,
      phone,
      address_detail,
      delivery_request
    );
    
    for (const item of items) {
      const [stockRows] = await db.query(
        "SELECT stock FROM products WHERE product_id = ?",
        [item.product_id]
      );
      const stock = stockRows[0]?.stock ?? null;
      if (stock === null || stock < item.quantity || stock === 0) {
        return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.PRODUCT_STOCK_OUT );
      }
      await orderModel.createOrderItem(order_id, item.product_id, item.quantity, item.price);

      //在庫を差し引く（同時に注文が入っているか在庫が足りない場合に備えて、在庫が十分な場合にのみ差し引くように条件を追加）
      const [updateResult] = await db.query(
        "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity]
      );
      if (updateResult.affectedRows === 0) {
        return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.STOCK_SHORTAGE);
      }

      //在庫控除により在庫数が0に変わったときのステータスを変更
      await db.query(
        "UPDATE products SET status = 2 WHERE product_id = ? AND stock = 0 AND status = 0",
        [item.product_id]
      );
    }
    await connection.commit(); //トランザクションの終了

    return response.success(res, { order_id }, RESPONSE_MESSAGES.SUCCESS.DEFAULT); 
  } catch (err) {
    console.error("注文作成エラー:", err);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

// 注文詳細の照会 本人の注文でなければ見えないように防御
export const getOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const orderData = await orderModel.getOrderWithItems(order_id);
    const orderRow = orderData?.order;
    const items = orderData?.items;
    if (!orderRow || !items || items.length === 0) {
      return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }
    // ご本人注文でなければ403(管理者除く)
    if (req.user.role !== "ADMIN" && orderRow.login_id !== req.user.login_id) {
      return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }
    return response.success(res, { order: orderRow, items }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    console.error("注文詳細エラー:", err);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

//ユーザー別注文リスト（防御2）
export const getOrdersByUser = async (req, res) => {
  try {
    const { login_id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.login_id !== login_id) {
      return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }
    const orders = await orderModel.getOrdersByUser(login_id);
    return response.success(res, { orders }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

//販売量統計
export const getAdminSalesStats = async (req, res) => {
  try {
    const trend = await orderModel.getSalesTrend();
    
    const summary = {
      todaySales: trend[trend.length - 1]?.daily_orders || 0,
      totalTrend: trend
    };

    return res.json(summary);
  } catch (error) {
    console.error("統計の読み込みに失敗しました。: ", error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};