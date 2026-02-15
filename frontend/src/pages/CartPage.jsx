import React, { useEffect, useState } from "react";
import api from "../api/axios"; //로그인 및 장바구니 확인 api
import { useNavigate } from "react-router-dom";
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
  const totalPrice = cartItems.reduce((acc, item) => { 
  if (item.status === 0) { return acc + item.price * item.quantity; }
  return acc; }, 0);// status가 0일 때만 금액을 더하고, 1이면 무시
 
  const fetchCartItems = async () => { //장바구니 데이터 불러오기
    if (!user) return;
    try {
      const res = await api.get(`/cart/${user.login_id}`); //api를 사용해서 장바구니 로딩
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
    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: stock } : item //최대 갯수를 재고수량으로 조정 
    ));
    return;
  }

  //예정)직접입력시 최대갯수 이상일 경우 재고개수로 바뀌게 해야함.
    console.log("현재 stock 갯수 : ",parseInt(stock));
    if (newQty < 1) return; //1보다 작은 숫자로 내려갈려 할경우
    if (newQty > stock) { newQty = stock; }
    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: newQty } : item //갯수 조정
    ));
    console.log("교체 후 상품 갯수 : ",parseInt(newQty));
  };





  const handleToggleStatus = async (cartItemId, currentStatus) => {
  const token = localStorage.getItem("token");
  console.log("현재 스토리지에 있는 토큰:", token);
  if (!token) {
    alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
    return;
  }
  const Status = currentStatus === 0 ? 1 : 0; //0과 1을 왔다 갔다하는 변수 생성
  const confirmMsg = Status === 1 ? "상품을 삭제하시겠습니까?" : "상품을 장바구니에 다시 넣으시겠습니까?";

  if (!window.confirm(confirmMsg)) return;
  try {
    const res = await api.patch(`/cart/item/${cartItemId}/status`, { status: Status });
    
    if (res.data.success) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, status: Status } : item )
      );
    }
  } catch (err) {
    console.error("상태 변경 에러:", err);
    alert("상태 변경에 실패했습니다.");
  }
};

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
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1, item.stock)}
                        disabled={item.quantity <= 1 || item.status === 1} > {/* status가 0인지에 따라 비활성화*/}
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField size = "small"
                                   value={item.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                    handleUpdateQty(item.cart_item_id, val);
                                    } }} 
                                onBlur={(e) => {handleUpdateQty(item.cart_item_id, e.target.value, item.stock); }} //마우스를 다른 곳에 클릭했을 시 함수 실행.
                                inputProps={{ style: { textAlign: 'center', width: '40px', padding: '5px' }, type: 'number' }}
                                //증가 감소 화살표 없애기
                                sx={{ "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0, } }} 
                                disabled={item.status === 1} />{/*status가 0인지에 따라 비활성화*/}
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1, item.stock)}
                        disabled={item.status === 1}>{/*status가 0인지에 따라 비활성화*/}
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
            <Button variant="contained" size="large" sx={{ px: 10 }}>注文</Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default CartPage;