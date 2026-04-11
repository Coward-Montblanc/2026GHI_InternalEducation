import api from "../api/axios";

//カートリストの照会（バッジの数はHeaderからcart.lengthとして計算）
export const getCart = async (loginId) => {
  try {
    const { data } = await api.get(`/cart/${loginId}`);
    return data.items || []; 
  } catch (error) {
    console.error("カートリスト取得エラー:", error);
    throw error;
  }
};

//カートに商品を追加
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

//カートアイテムステータス（削除/修復） 
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
