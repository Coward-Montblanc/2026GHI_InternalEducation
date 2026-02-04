// Header.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // 로그인 상태를 가져옴

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 유저 정보, 로그아웃 함수 호출
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
                  color="Blue" 
                  sx={{ mr: 2 }}
                  onClick={() => navigate("/admin/product-add")}
                >
                  商品登録
                </Button>
              )}
              <Typography variant="body1" sx={{ mr: 2 }}>
                <strong>{user.name || user.login_id}</strong>님 환영합니다
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
