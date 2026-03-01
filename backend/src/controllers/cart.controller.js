import db from "../config/db.js";
import * as cartModel from "../models/cart.model.js";
import response from "../utils/response.js";


export const getCartItems = async (req, res) => {
  const { login_id } = req.params;
  if (req.user?.login_id !== login_id) {
    return response.error(res, "本人のカートのみ閲覧できます。", 403);
  }
  try {
    const items = await cartModel.getCartItemsByLoginId(login_id);
    return response.success(res, { items: items }, "カート取得成功", 200);
  } catch (err) {
    console.error("カート取得エラー:", err);
    return response.error(res, "データベース取得中にエラーが発生しました。", 500);
  }
};

export const addToCart = async (req, res) => {
  const { login_id, product_id, quantity } = req.body;
  if (req.user?.login_id !== login_id) {
    return response.error(res, "本人のカートにのみ追加できます。", 403);
  }
  try {
    const cartId = await cartModel.getOrCreateCart(login_id); //장바구니 ID 가져오기 (없으면 자동생성)
    
    await cartModel.addOrUpdateItem(cartId, product_id, quantity); //아이템 추가
    return response.success(res, {}, 200);
  } catch (err) {
    console.error("カート追加エラー:", err);
    return response.error(res, "サーバーエラーが発生しました。", 500);
  }
};

export const removeCartItem = async (req, res) => { //장바구니 내 상품 삭제
  const { cart_item_id } = req.params;
  const currentUser = req.user?.login_id;
  if (!currentUser) return response.error(res, "ログインが必要です。", 401);
  try {
    const [rows] = await db.query(
      `SELECT c.login_id FROM cart_items ci JOIN carts c ON ci.cart_id = c.cart_id WHERE ci.cart_item_id = ?`,
      [cart_item_id]
    );
    if (!rows?.length || rows[0].login_id !== currentUser) {
      return response.error(res, "商品とユーザーIDが一致しません。", 403);
    }
    await cartModel.deleteCartItem(cart_item_id);
    return response.success(res, {}, "商品が削除されました。", 200);
  } catch (err) {
    console.error("削除エラー:", err);
    return response.error(res, "削除中にサーバーエラーが発生しました。", 500);
  }
};



export const toggleCartItemStatus = async (req, res) => {
  const { cart_item_id } = req.params;
  const { status } = req.body; // 프론트에서 바꿀 상태값(0 또는 1)을 보냄
  const currentUser = req.user.login_id; //jwt 로그인 토큰에서 로그인 정보를 가져와서 login_id 데이터 가져옴


  try {
    const [rows] = await db.query( //상품이 유저와 일치하는 지 확인하는 쿼리
      `SELECT c.login_id 
       FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.cart_id 
       WHERE ci.cart_item_id = ?`,
      [cart_item_id]
    );
    
    console.log("--- 소유권 검증 시작 ---");
    console.log("DB에 저장된 주인 ID:", rows[0].login_id);
    console.log("현재 로그인한 유저 ID:", currentUser);
    console.log("두 값이 일치하나?:", rows[0].login_id === currentUser);

    if (rows[0].login_id !== currentUser) { //회원이 일치하지 않을경우
      return response.error(res, "本人のカート商品だけを修正できます。", 403);
    }

    await cartModel.toggleCartItem(status, cart_item_id);
    
    res.json({ success: true, message: status === 1 ? "非活性化されました。" : "活性化されました。" });
  } catch (error) {
    console.error("サーバーエラー :", error);
    return response.error(res, "サーバーエラー ", 500);
  }
};
