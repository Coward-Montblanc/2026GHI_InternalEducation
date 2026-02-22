import api from "../api/axios";

//장바구니 목록 조회 (뱃지 개수는 Header에서 cart.length로 계산)
export const getCart = async (loginId) => {
  try {
    const { data } = await api.get(`/cart/${loginId}`);
    return data.items || []; //데이터 배열로 반환하게
  } catch (error) {
    console.error("カートリスト取得エラー:", error);
    throw error;
  }
};

//장바구니에 상품 추가
export const addToCart = async (loginId, productId, quantity) => {
  try {
    const { data } = await api.post("/cart/addcart", {
      login_id: loginId,
      product_id: productId,
      quantity,
    });
    return data;
  } catch (error) {
    console.error("カート商品追加エラー:", error);
    throw error;
  }
};

//장바구니 항목 상태 (삭제/복구) 
export const updateCartItemStatus = async (cartItemId, status) => {
  try {
    const { data } = await api.patch(`/cart/item/${cartItemId}/status`, {
      status,
    });
    return data;
  } catch (error) {
    console.error("カート項目の状態変更エラー:", error);
    throw error;
  }
};
