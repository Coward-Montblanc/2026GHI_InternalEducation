import api from "../api/axios";

//단일(갯수 상관x 한 상품) 상품저장
export function singleProductToItems(product, quantity) {
  return [{
    product_id: product.product_id,
    name: product.name,
    price: product.price,
    quantity,
    image_url: product.images?.[0]?.image_url || ""
  }];
}

  // //장바구니나 다수 상품들을 구매 페이지로 이동 CartService로 이동시켜서 미사용
  // export function cartItemsToItems(cartItems) {
  //   return cartItems
  //     .filter(item => item.status !== 1)
  //     .map(item => ({
  //       product_id: item.product_id,
  //       name: item.name,
  //       price: item.price,
  //       quantity: item.quantity,
  //       image_url: item.image_url
  //     }));
  // }

//상품 이동 담당
export function goToBuyPage(navigate, items) {
  navigate("/buy", { state: { items } });
}

//주문 생성 
export async function createOrder(orderData) {
  const { data } = await api.post("/orders", orderData);
  return data;
}
