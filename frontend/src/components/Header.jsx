// Header.jsx
import { useEffect } from "react";
import {
  AppBar, Toolbar,
  Typography,
  Box
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
  }, [user, location.pathname]);
  
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ 
        width: "100%", 
        maxWidth: "1000px", 
        mx: "auto",
        justifyContent: "space-between",
        px: { xs: 2, sm: 0 }
      }}>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", fontWeight: "bold", ml: 2 }}
          onClick={() => navigate("/")}
        >
          ByeMart
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                <strong>{user.name || user.login_id}</strong>様、ようこそ！
              </Typography>
            </>
          ) : (
            <>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
    
  );
}

export default Header;
