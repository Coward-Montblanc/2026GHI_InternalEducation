import { useEffect, useState } from "react";
import { getCart, updateCartItemStatus } from "../services/CartService";
import { useAuth } from "../contexts/AuthContext";
import storage from "../utils/storage";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const url = import.meta.env.VITE_API_URL;
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const totalPrice = cartItems.reduce((acc, item) => { 
  if (item.status === 0) { return acc + item.price * item.quantity; }
  return acc; }, 0);

  const fetchCartItems = async () => { //カートデータを読み込む
    if (!user?.login_id) return;
    try {
      const data = await getCart(user.login_id);
      setCartItems(data);
    } catch (err) {
      console.error("カート読み込み失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user?.login_id]);

 
  const handleUpdateQty = (itemId, newQty, stock) => { 
    if (parseInt(newQty) > stock) {
    alert(`現在の在庫(${stock}個)までしか注文できません。`);
    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: stock } : item //最大数を在庫数量に調整 
    ));  return; }

        if (newQty < 1) return;
        if (newQty > stock) { newQty = stock; }
        setCartItems(items => items.map(item => 
        item.cart_item_id === itemId ? { ...item, quantity: newQty } : item
        ));
    };

    const handleToggleStatus = async (cartItemId, currentStatus) => {
    const token = storage.get("token");
    if (!token) {
        alert("ログイン情報がありません。再度ログインしてください。");
        return;
     }
    const Status = currentStatus === 0 ? 1 : 0;
    const confirmMsg = Status === 1 ? "商品を削除しますか？" : "商品をカートに戻しますか？";

    if (!window.confirm(confirmMsg)) return;
    try {
        const res = await updateCartItemStatus(cartItemId, Status);
        if (res.success) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, status: Status } : item )
        );
      }
    }catch (err) {
        console.error("状態変更エラー:", err);
        if (err.response) {
        console.error("サーバー応答コード:", err.response.status);
        console.error("サーバー応答データ:", err.response.data);
        }
        alert("状態変更に失敗しました。");
    }
    };
    return {
  cartItems, loading, 
  url,totalPrice,
  handleUpdateQty, 
  handleToggleStatus
    };
};