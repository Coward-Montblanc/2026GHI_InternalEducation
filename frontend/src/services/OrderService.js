import api from "../api/axios";

export const getAdminOrders = async (params) => {
  try {
    
    const { data } = await api.get("/orders", { params });
    console.log("전체 응답 객체 키:", Object.keys(data));
    console.log(data);
    return data;
  } catch (error) {
    console.error("ユーザ一覧取得エラー:", error);
    throw error;
  }
};

//シングル（本数相関×1商品）商品保存
export function singleProductToItems(product, quantity) {
  try {
    return [{
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.images?.[0]?.image_url || ""
    }];
  } catch (error) {
    console.error("SingleOrderタイプエラー:", error);
    return [];
  }
}

// 単一商品購入ページに移動
export function BuyPageSingle(navigate, product, quantity) {
  const items = singleProductToItems(product, quantity);
  navigate("/buy", { state: { items } });
}

//ショッピングカート商品購入ページに移動
export function BuyPageMany(navigate, cartItems) {
  const items = (Array.isArray(cartItems) ? cartItems : [])
    .filter(item => item?.status !== 1)
    .map(item => ({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url
    }));
  navigate("/buy", { state: { items } });
}

//オーダー作成
export async function createOrder(orderData) {
  try {
    const { data } = await api.post("/orders", orderData);
    return data;
  } catch (error) {
    console.error("注文作成中にエラー:", error);
    throw error;
  }
}

//注文詳細照会（確認ページ用）
export async function getOrder(orderId) {
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  } catch (error) {
    console.error("注文取得エラー:", error);
    throw error;
  }
}

// 会員別注文リストの照会
export async function getOrdersByUser(loginId) {
  try {
    const { data } = await api.get(`/orders/user/${loginId}`);
    return data;
  } catch (error) {
    console.error("注文一覧取得エラー:", error);
    throw error;
  }
}

export const ORDER_STATUS_LABELS = {
  0: "注文キャンセル",
  1: "注文完了（準備中）",
  2: "配送中",
  3: "配送完了",
};

export function getOrderStatusLabel(status) { 
  if (status === null || status === undefined) return ORDER_STATUS_LABELS[1];
  const n = Number(status);
  return ORDER_STATUS_LABELS[n] ?? status;
}
