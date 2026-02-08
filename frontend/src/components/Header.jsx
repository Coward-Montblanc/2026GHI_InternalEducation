// Header.jsx
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,      // 장바구니 버튼용 추가
  IconButton,
  Stack
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // 추가
import { useNavigate, useLocation } from "react-router-dom"; // useLocation 추가
import { useAuth } from "../contexts/AuthContext"; // 로그인 상태를 가져옴
import axios from "axios";


function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // 유저 정보, 로그아웃 함수 호출
  const [cartCount, setCartCount] = useState(0);
  const url = import.meta.env.VITE_API_URL;

  const fetchCartCount = async () => { //장바구니 버튼 + 숫자표시
    if (user?.login_id) {
      try {
        const res = await axios.get(`${url}/api/cart/${user.login_id}`);
        setCartCount(res.data.length);
      } catch (err) {
        console.error("Cart error:", err);
      }
    }
  };

  useEffect(() => { //페이지 바뀔 때마다 갱신
    fetchCartCount();
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    alert("ログアウトしました。");
    navigate("/");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          ByeMart
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{/* 로그인 여부에 따라 다르게 나타남. */}
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  sx={{ mr: 2 }}
                  onClick={() => navigate("/admin/product-add")}
                >
                  商品登録
                </Button>
              )}

              <IconButton //장바구니 버튼
                color="inherit" 
                sx={{ mr: 2 }} 
                onClick={() => navigate("/cart")}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <Typography variant="body1" sx={{ mr: 2 }}>
                <strong>{user.name || user.login_id}</strong>様、ようこそ！
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate("/login")}>
                ログイン
              </Button>
              <Button color="inherit" onClick={() => navigate("/signup")}>
                会員登録
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
