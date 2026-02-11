import db from "../config/db.js";





// 장바구니 생성 및 확인
export async function getOrCreateCart(login_id) {
  let [cart] = await db.query("SELECT cart_id FROM carts WHERE login_id = ?", [login_id]);
  
  if (cart.length === 0) {
    const [result] = await db.query("INSERT INTO carts (login_id) VALUES (?)", [login_id]);
    return result.insertId;
  }
  return cart[0].cart_id;
}

// 아이템 추가 및 업데이트
export async function addOrUpdateItem(cart_id, product_id, quantity) {
  const [existing] = await db.query(
    "SELECT cart_item_id FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cart_id, product_id]
  );

  if (existing.length > 0) {// 상품이 이미 존재하면 수량을 더하고 status를 활성으로 강제 변경
    return await db.query(
      "UPDATE cart_items SET quantity = quantity + ?, status = 0 WHERE cart_item_id = ?",
      [quantity, existing[0].cart_item_id]
    );
  } else {
    return await db.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart_id, product_id, quantity]
    );
  }
}
//장바구니 페이지 상품 수량에 덮어쓰기
export async function updateItemQuantity(cart_item_id, quantity) { 
  return await db.query(
    "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?",
    [quantity, cart_item_id]
  );
}

export async function getCartItemsByLoginId(login_id) { //장바구니 조회
  const query = `
    SELECT 
        ci.cart_item_id, 
        ci.quantity, 
        ci.status,
        p.product_id, 
        p.name, 
        p.price,
        p.stock,
        ci.quantity,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_url
    FROM carts c 
    JOIN cart_items ci ON c.cart_id = ci.cart_id 
    JOIN products p ON ci.product_id = p.product_id 
    WHERE c.login_id = ?
    ORDER BY ci.status ASC, ci.cart_item_id DESC`;
  const [rows] = await db.query(query, [login_id]);
  return rows;
}

export async function toggleCartItem(status, cart_item_id) { //장바구니 내 상품 상태 변경 시키기
  const query = "UPDATE cart_items SET status = ? WHERE cart_item_id = ?";
  const [result] = await db.query(query, [status, cart_item_id]);
  return result;
}

