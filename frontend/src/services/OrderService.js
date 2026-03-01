import api from "../api/axios";

// 단일(갯수 상관x 한 상품) 상품저장
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

// 단일 상품 구매 페이지로 이동
export function BuyPageSingle(navigate, product, quantity) {
  const items = singleProductToItems(product, quantity);
  navigate("/buy", { state: { items } });
}

// 장바구니 상품 구매 페이지로 이동
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

// 주문 생성
export async function createOrder(orderData) {
  try {
    const { data } = await api.post("/orders", orderData);
    return data;
  } catch (error) {
    console.error("注文作成中にエラー:", error);
    throw error;
  }
}

// 주문 상세 조회 (확인 페이지용)
export async function getOrder(orderId) {
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  } catch (error) {
    console.error("注文取得エラー:", error);
    throw error;
  }
}

// 회원별 주문 목록 조회
export async function getOrdersByUser(loginId) {
  try {
    const { data } = await api.get(`/orders/user/${loginId}`);
    return data;
  } catch (error) {
    console.error("注文一覧取得エラー:", error);
    throw error;
  }
}

// 주문 상태 코드 일본어 표시 (ORDERED / PREPARE / DELIVERY / COMPLETE / CANCELED)
export const ORDER_STATUS_LABELS = {
  ORDERED: "注文完了",
  PREPARE: "準備中",
  DELIVERY: "配送中",
  COMPLETE: "配送完了",
  CANCELED: "注文キャンセル",
};

export function getOrderStatusLabel(status) {
  if (!status) return ORDER_STATUS_LABELS.ORDERED;
  const key = String(status).toUpperCase();
  return ORDER_STATUS_LABELS[key] ?? status;
}
