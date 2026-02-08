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

  if (existing.length > 0) {
    return await db.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?",
      [quantity, existing[0].cart_item_id]
    );
  } else {
    return await db.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart_id, product_id, quantity]
    );
  }
}

export async function getCartItemsByLoginId(login_id) { //장바구니 조회
  const query = `
    SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_url
    FROM carts c JOIN cart_items ci ON c.cart_id = ci.cart_id JOIN products p ON ci.product_id = p.product_id WHERE c.login_id = ?`;
  const [rows] = await db.query(query, [login_id]);
  return rows;
}

export async function deleteCartItem(cart_item_id) { //장바구니 내 상품 삭제
  const query = "DELETE FROM cart_items WHERE cart_item_id = ?";
  const [result] = await db.query(query, [cart_item_id]);
  return result;
}