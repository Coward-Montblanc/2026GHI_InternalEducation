import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; //로그인
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));

 
  const fetchCartItems = async () => { //장바구니 데이터 불러오기
    if (!user) return;
    try {
      const res = await axios.get(`${url}/api/cart/${user.login_id}`);
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

  const handleDeleteItem = async (cartItemId) => { //장바구니 내 상품 삭제
  if (!window.confirm("정말 삭제하시겠습니까?")) return;
  try {
    const res = await axios.delete(`${url}/api/cart/item/${cartItemId}`); //상품 아이디
    if (res.data.success) { // 삭제 성공 시 상태 업데이트
      setCartItems((prevItems) => 
        prevItems.filter((item) => item.cart_item_id !== cartItemId)
      );
      alert("삭제되었습니다.");
    }
  } catch (err) {
    console.error("삭제 실패:", err);
    alert("삭제에 실패했습니다.");
  }
};
  

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0); //총 금액

 
  const handleUpdateQty = (itemId, newQty) => {  //수량 변경
    if (newQty < 1) return;
    // 임시로 프론트에서만 변경 (실제론 axios.put 호출 권장)
    setCartItems(items => items.map(item => 
      item.cart_item_id === itemId ? { ...item, quantity: newQty } : item
    ));
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
                  <TableRow key={item.cart_item_id}>
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
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {(item.price * item.quantity).toLocaleString()}円
                    </TableCell>
                    <TableCell align="center"> {/*상품 삭제 버튼*/}
                      <IconButton color="error" onClick={() => handleDeleteItem(item.cart_item_id)}><DeleteIcon /></IconButton>
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
              onClick={() => navigate("/buy", { state: { cartItems } })} //구매 페이지로 정보값 전송
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