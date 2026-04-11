import db from "../config/db.js";

//ショッピングカートの作成と確認
export async function getOrCreateCart(login_id) {
  const [cart] = await db.query("SELECT cart_id FROM carts WHERE login_id = ?", [login_id]);
  if (cart.length > 0) return cart[0].cart_id;
  const [[rows]] = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(cart_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM carts"
  );
  const cart_id = `CT${rows.n}`;
  await db.query("INSERT INTO carts (cart_id, login_id) VALUES (?, ?)", [cart_id, login_id]);
  return cart_id; 
}

//アイテムの追加と更新
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

//カートページの商品数量で上書き
export async function updateItemQuantity(cart_item_id, quantity) { 
  return await db.query(
    "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?",
    [quantity, cart_item_id]
  );
}

export async function getCartItemsByLoginId(login_id) { //カートを見る
  const query = `
    SELECT 
        ci.cart_item_id, 
        ci.quantity, 
        ci.status,
        p.product_id, 
        p.name, 
        p.price,
        p.stock,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id AND role = 1 LIMIT 1) as image_url
    FROM carts c 
    JOIN cart_items ci ON c.cart_id = ci.cart_id 
    JOIN products p ON ci.product_id = p.product_id 
    WHERE c.login_id = ?
    ORDER BY ci.status ASC, ci.cart_item_id DESC`;
  const [rows] = await db.query(query, [login_id]);
  return rows;
}

export async function toggleCartItem(status, cart_item_id) { //カート内の商品の状態を変更する
  const query = "UPDATE cart_items SET status = ? WHERE cart_item_id = ?";
  const [result] = await db.query(query, [status, cart_item_id]);
  return result;
}