import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios"; //로그인
import { cartItemsToItems, goToBuyPage } from '../services/BuyService.js';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Stack, Divider,
  TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayIcon from "@mui/icons-material/Replay";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0); //총 금액
 
  const fetchCartItems = async () => { //장바구니 데이터 불러오기
      if (!user) return;
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `${url}/api/cart/${user.login_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setCartItems(res.data);
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
  const token = localStorage.getItem("token"); //토큰 여부 판별
  if (!token) {
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  }
}, []);

 
  const handleUpdateQty = (itemId, newQty, stock) => {  //수량 변경
    //상품 현 재고 이상으로 수량을 올릴 시 에러
    if (parseInt(newQty) > stock) { 
    alert(`현재 재고(${stock}개)까지만 주문 가능합니다.`);
    updateLocalState(cartItemId, stock); // 최대 재고로 강제 설정
    return;
  }

  //예정)직접입력시 최대갯수 이상일 경우 재고개수로 바뀌게 해야함.

    if (newQty < 1) return; //1보다 작은 숫자로 내려갈려 할경우

    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: newQty } : item
    ));
  };

const handleToggleStatus = async (cartItemId, currentStatus) => {
  const token = localStorage.getItem("token");
  console.log("현재 스토리지에 있는 토큰:", token);
  if (!token) {
    alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
    return;
  }
  const Status = currentStatus === 0 ? 1 : 0;
  const confirmMsg = Status === 1 ? "상품을 삭제하시겠습니까?" : "상품을 장바구니에 다시 넣으시겠습니까?";

  if (!window.confirm(confirmMsg)) return;
  try {
    const res = await api.patch(
      `/cart/item/${cartItemId}/status`,
      { status: Status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (res.data.success) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, status: Status } : item )
      );
    }
  } catch (err) {
  console.error("상태 변경 에러:", err); // 전체 에러 객체 출력
  if (err.response) {
    // 서버에서 반환한 상태 코드와 메시지 출력
    console.error("서버 응답 코드:", err.response.status);
    console.error("서버 응답 데이터:", err.response.data);
  }
  alert("상태 변경에 실패했습니다.");
}
};
//예정) 상태변수만 바꾸는 것이 아닌 증가 감소 버튼, 직접입력 창, 합계금액 제외 등 기능구현



  return (
    <Box sx={{ p: 5, maxWidth: "1000px", margin: "0 auto" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>カート</Typography>

      {cartItems.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 10 }}>カートは空です。</Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                <TableRow>
                  <TableCell>商品</TableCell>
                  <TableCell align="center">数量</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell align="center">削除</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.cart_item_id}
                    sx={{
                          bgcolor: item.status === 1 ? "#f9f9f9" : "inherit", // 비활성 시 배경색 변경
                          opacity: item.status === 1 ? 0.6 : 1 // 비활성 시 반투명 처리
                        }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <img 
                          src={`${url}${item.image_url}`} 
                          alt={item.name} 
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} 
                        />
                        <Typography variant="body1">{item.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center"> {/*상품 수량 늘리고 줄이기*/}
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1, item.stock)} disabled={item.quantity <= 1}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField size = "small"
                                   value={item.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                    handleUpdateQty(item.cart_item_id, val);
                                    }
                                }} inputProps={{ style: { textAlign: 'center', width: '40px', padding: '5px' }, type: 'number' }}
                                //증가 감소 화살표 없애기
                                sx={{ "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0, } }} />
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1, item.stock)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {(item.price * item.quantity).toLocaleString()}円
                    </TableCell>
                    <TableCell align="center"> {/*상품 삭제 버튼*/}
                      <IconButton color={item.status === 1 ? "primary" : "error"} //활성화 상태에 따라 아이콘이 바뀜.
                                  onClick={() => handleToggleStatus(item.cart_item_id, item.status)}>
                                    {item.status === 1 ? <ReplayIcon /> : <DeleteIcon />}
                                  </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: "8px", textAlign: "right" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>合計金額</Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: "bold", mb: 3 }}>
              {totalPrice.toLocaleString()}円
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ px: 10 }}
              onClick={() => {
                const items = cartItemsToItems(cartItems);
                goToBuyPage(navigate, items);
              }}
              disabled={cartItems.length === 0}
            >
              注文
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default CartPage;