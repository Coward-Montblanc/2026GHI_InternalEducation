// Header.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          ByeMart
        </Typography>

        <Box>
          <Button color="inherit" onClick={() => navigate("/login")}>
            ログイン
          </Button>
          <Button color="inherit" onClick={() => navigate("/signup")}>
            会員登録
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;