import api from "../api/axios";

//장바구니 목록 조회
export const getCart = async (loginId) => {
  const { data } = await api.get(`/cart/${loginId}`);
  return data;
};

//장바구니 개수 조회 (헤더 배지용)
export const getCartCount = async (loginId) => {
  const { data } = await api.get(`/cart/${loginId}`);
  return Array.isArray(data) ? data.length : 0;
};

//장바구니에 상품 추가
export const addToCart = async (loginId, productId, quantity) => {
  const { data } = await api.post("/cart/addcart", {
    login_id: loginId,
    product_id: productId,
    quantity,
  });
  return data;
};

//장바구니 항목 상태 (삭제/복구) 
export const updateCartItemStatus = async (cartItemId, status) => {
  const { data } = await api.patch(`/cart/item/${cartItemId}/status`, {
    status,
  });
  return data;
};
