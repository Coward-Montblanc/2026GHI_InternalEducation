export function goToBuyPage(navigate, items) {
  navigate("/buy", { state: { items } });
}

// 단일 상품(1개든 100개든) items 배열로 변환 후 카트로
export function singleProductToItems(product, quantity) {
  return [{
    product_id: product.product_id,
    name: product.name,
    price: product.price,
    quantity,
    image_url: product.images?.[0]?.image_url || ""
  }];
}

// 장바구니(여러개) 상품들을 items 배열로 변환 후 카트로
export function cartItemsToItems(cartItems) {
  return cartItems.filter(item => item.status !== 1).map(item => ({
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url
  }));
}