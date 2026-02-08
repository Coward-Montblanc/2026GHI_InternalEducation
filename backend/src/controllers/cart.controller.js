import * as cartModel from "../models/cart.model.js";

export const getCartItems = async (req, res) => {
  const { login_id } = req.params;

  try {
    const items = await cartModel.getCartItemsByLoginId(login_id);
    res.status(200).json(items);
  } catch (err) {
    console.error("장바구니 조회 에러:", err);
    res.status(500).json({ message: "데이터베이스 조회 오류" });
  }
};

export const addToCart = async (req, res) => {
  const { login_id, product_id, quantity } = req.body;
  
  try {
    const cartId = await cartModel.getOrCreateCart(login_id); //장바구니 ID 가져오기 (없으면 자동생성)
    
    await cartModel.addOrUpdateItem(cartId, product_id, quantity); //아이템 추가
    
    res.status(200).json({ success: true, message: "カートに追加されました。" });
  } catch (err) {
    console.error("Cart Controller Error:", err);
    res.status(500).json({ success: false, message: "서버 에러" });
  }
};

export const removeCartItem = async (req, res) => { //장바구니 내 상품 삭제
  const { cart_item_id } = req.params;

  try {
    await cartModel.deleteCartItem(cart_item_id);
    res.status(200).json({ success: true, message: "商品が削除されました。" });
  } catch (err) {
    console.error("삭제 에러:", err);
    res.status(500).json({ success: false, message: "삭제 중 서버 에러 발생" });
  }
};