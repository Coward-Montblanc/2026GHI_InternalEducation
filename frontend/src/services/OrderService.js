import api from "../api/axios";

//단일(갯수 상관x 한 상품) 상품저장
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

//주문 생성 
export async function createOrder(orderData) {
  try {
    const { data } = await api.post("/orders", orderData);
    return data;
  } catch (error) {
    console.error("注文作成中にエラー:", error);
    throw error;
  }
}
