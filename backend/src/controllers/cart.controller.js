import db from "../config/db.js";
import * as cartModel from "../models/cart.model.js";



export const getCartItems = async (req, res) => {
  const { login_id } = req.params;
  
  try {
    const items = await cartModel.getCartItemsByLoginId(login_id);
    res.status(200).json(items);
  } catch (err) {
    console.error("カート取得エラー:", err);
    res.status(500).json({ message: "データベース取得中にエラーが発生しました。" });
  }
};

export const addToCart = async (req, res) => { 
  const { login_id, product_id, quantity } = req.body;

  try {
    const cartId = await cartModel.getOrCreateCart(login_id); //장바구니 ID 가져오기 (없으면 자동생성)
    
    await cartModel.addOrUpdateItem(cartId, product_id, quantity); //아이템 추가
    
    res.status(200).json({ success: true, message: "カートに追加されました。" });
  } catch (err) {
    console.error("カート追加エラー:", err);
    res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
};

export const removeCartItem = async (req, res) => { //장바구니 내 상품 삭제
  const { cart_item_id } = req.params;
  //상품이 유저와 일치하는 지 확인하는 쿼리
  const [item] = await db.query("select c.login_id from cart_item ci join carts c on ci.cart_id = c.cart_id where ci.cart_item_id = ?",
    [cart_item_id]
  );
  if (item.login_id !== current_user) { //일치하지 않을 경우
    return res.status(403).send("商品とユーザーIDが一致しません");
  }

  try {
    await cartModel.deleteCartItem(cart_item_id);
    res.status(200).json({ success: true, message: "商品が削除されました。" });
  } catch (err) {
    console.error("削除エラー:", err);
    res.status(500).json({ success: false, message: "削除中にサーバーエラーが発生しました。" });
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
      return res.status(403).json({ success: false, message: "本人のカート商品だけを修正できます。" });
    }

    await cartModel.toggleCartItem(status, cart_item_id);
    
    res.json({ success: true, message: status === 1 ? "非活性化されました。" : "活性化されました。" });
  } catch (error) {
    console.error("サーバーエラー :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
