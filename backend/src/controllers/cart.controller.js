import db from "../config/db.js";
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
  // 수량이 문자열일경우 또는 상품아이디가 없을 리퀘스트, 로그인하지않은 유저가 임의 유저ID로 불러오는걸 방지
  // 파라미터 공격을 검증하는 것 추가. JWT나 세션을 사용하기
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
  //상품이 유저와 일치하는 지 확인하는 쿼리
  const [item] = await db.query("select c.login_id from cart_item ci join carts c on ci.cart_id = c.cart_id where ci.cart_item_id = ?",
    [cart_item_id]
  );
  if (item.login_id !== current_user) { //일치하지 않을 경우
    return res.status(403).send("상품과 유저 아이디가 일치하지않음");
  }

  try {
    await cartModel.deleteCartItem(cart_item_id);
    res.status(200).json({ success: true, message: "商品が削除されました。" });
  } catch (err) {
    console.error("삭제 에러:", err);
    res.status(500).json({ success: false, message: "삭제 중 서버 에러 발생" });
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
    
    if (rows[0].login_id !== currentUser) { //회원이 일치하지 않을경우
      return res.status(403).json({ success: false, message: "본인의 장바구니 상품만 수정할 수 있습니다." });
    }

    await cartModel.toggleCartItem(status, cart_item_id);
    
    res.json({ success: true, message: status === 1 ? "비활성화되었습니다." : "활성화되었습니다." });
  } catch (error) {
    console.error("서버 에러 :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
