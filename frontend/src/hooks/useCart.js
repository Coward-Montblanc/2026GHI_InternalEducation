import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItemStatus } from "../services/CartService";
import { storage } from "../utils/storage"; //스토리지 

export const useCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const url = import.meta.env.VITE_API_URL;
  const user = storage.get("user"); 

  const totalPrice = cartItems.reduce((acc, item) => { 
  if (item.status === 0) { return acc + item.price * item.quantity; }
  return acc; }, 0);// status가 0일 때만 금액을 더하고, 1이면 무시

  const fetchCartItems = async () => { //장바구니 데이터 불러오기
    if (!user) return;
    try {
      const data = await getCart(user.login_id);
      setCartItems(data);
    } catch (err) {
      console.error("장바구니 로딩 실패:", err);
    }
  };

  useEffect(() => { //로그인 상태 확인
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      fetchCartItems();
    }
  }, []);

  useEffect(() => { //토큰 만료시 리다이렉트
  const token = storage.get("token"); //토큰 여부 판별
  if (!token) {
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  }
  }, []);

 
  const handleUpdateQty = (itemId, newQty, stock) => {  //수량 변경
    if (parseInt(newQty) > stock) {  //상품 현 재고 이상으로 수량을 올릴 시 에러
    alert(`현재 재고(${stock}개)까지만 주문 가능합니다.`);
    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: stock } : item //최대 갯수를 재고수량으로 조정 
    ));  return; }

        if (newQty < 1) return; //1보다 작은 숫자로 내려갈려 할경우
        if (newQty > stock) { newQty = stock; }
        setCartItems(items => items.map(item => 
        item.cart_item_id === itemId ? { ...item, quantity: newQty } : item //갯수 조정
        ));
    };

    const handleToggleStatus = async (cartItemId, currentStatus) => {
    const token = storage.get("token");
    if (!token) { //토큰이 발견되지 않을 시 = undefined
        alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
        return;
     }
    const Status = currentStatus === 0 ? 1 : 0;
    const confirmMsg = Status === 1 ? "상품을 삭제하시겠습니까?" : "상품을 장바구니에 다시 넣으시겠습니까?";

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
        console.error("상태 변경 에러:", err);
        if (err.response) {
        console.error("서버 응답 코드:", err.response.status);
        console.error("서버 응답 데이터:", err.response.data);
        }
        alert("상태 변경에 실패했습니다.");
    }
    };
    return {
  cartItems, 
  url,totalPrice,
  handleUpdateQty, 
  handleToggleStatus
    };
};