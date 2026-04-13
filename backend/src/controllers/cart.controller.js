import db from "../config/db.js";
import * as cartModel from "../models/cart.model.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES, STATUS_MESSAGES } from "../config/constants.js";

export const getCartItems = async (req, res) => {
  const { login_id } = req.params;
  
  if (req.user?.login_id !== login_id) {
    return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.FORBIDDEN);
  }
  try {
    const items = await cartModel.getCartItemsByLoginId(login_id);
    return response.success(res, { items: items }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    console.error("カート取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const addToCart = async (req, res) => {
  const { login_id, product_id, quantity } = req.body;
  if (req.user?.login_id !== login_id) {
    return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.FORBIDDEN);
  }
  try {
    const cartId = await cartModel.getOrCreateCart(login_id); //カートIDの取得（ない場合は自動生成）
    
    await cartModel.addOrUpdateItem(cartId, product_id, quantity); //アイテムを追加
    return response.success(res, {}, 200);
  } catch (err) {
    console.error("カート追加エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const removeCartItem = async (req, res) => { //カート内の商品を削除
  const { cart_item_id } = req.params;
  const currentUser = req.user?.login_id;
  if (!currentUser) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.UNAUTHORIZED);
  try {
    const [rows] = await db.query(
      `SELECT c.login_id FROM cart_items ci JOIN carts c ON ci.cart_id = c.cart_id WHERE ci.cart_item_id = ?`,
      [cart_item_id]
    );
    if (!rows?.length || rows[0].login_id !== currentUser) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.DATA_MATCHING_ERROR);
    }
    await cartModel.deleteCartItem(cart_item_id);
    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    console.error("削除エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};



export const toggleCartItemStatus = async (req, res) => {
  const { cart_item_id } = req.params;
  const { status } = req.body; // フロントから変更するステータス値（0または1）を送信する
  const currentUser = req.user.login_id; //jwtログイントークンからログイン情報を取得してlogin_idデータを取得する


  try {
    const [rows] = await db.query( //商品がユーザーと一致することを確認するクエリ
      `SELECT c.login_id 
       FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.cart_id 
       WHERE ci.cart_item_id = ?`,
      [cart_item_id]
    );

    if (rows[0].login_id !== currentUser) { //会員が一致しない場合
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.FORBIDDEN);
    }

    await cartModel.toggleCartItem(status, cart_item_id);
    
    const message = status === 1 ? STATUS_MESSAGES.USER.DEACTIVATED : STATUS_MESSAGES.USER.ACTIVATED;
    return response.success(res, {}, message);
  } catch (error) {
    console.error("サーバーエラー :", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};
