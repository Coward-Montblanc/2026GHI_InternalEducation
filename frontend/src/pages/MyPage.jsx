import { useState, useEffect } from "react";
import { Box, Paper, List, ListItemButton, ListItem, ListItemText, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { LoadingView } from "../components/LoadingCircle";
import MyWithdraw from "./MyWithdraw"
import MyOrdersPage from "./MyOrdersPage";
import MyProfile from "./MyProfile";
import AdminProductList from "./AdminProductList";
import AdminUserList from "./AdminUserList";
import AdminOrderManagement from "./AdminOrderManagement";
import AdminSalesStats from "./AdminSalesStats";

const USER_MENU = [
  { key: "profile", label: "会員情報" },
  { key: "orders",  label: "注文履歴" },
  { key: "withdraw", label: "会員脱退" },
];

const ADMIN_MENU = [
  { key: "adminProducts", label: "商品管理" },
  { key: "adminUsers",    label: "ユーザー一覧" },
  { key: "adminOrders",   label: "ユーザー注文管理" },
  { key: "adminSales",    label: "販売統計" },
];

function MyPage({ initialView }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [view, setView] = useState(initialView || (isAdmin ? "adminProducts" : "profile"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) { return ( <LoadingView /> ); }

  const menu = isAdmin ? ADMIN_MENU : USER_MENU;

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: { xs: 1, md: 3 } }}>
        
        {/* 左サイドバー */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width: { xs: "100px", sm: "180px", md: "240px" }, 
            flexShrink: 0,
            borderRadius: 4,
            position: "sticky", 
            top: 20,
            overflow: "hidden",
          }}
        >
          <List sx={{ p: 1 }}>
            {menu.map(({ key, label }) => (
              <ListItem key={key} disablePadding>
                <ListItemButton
                  selected={view === key}
                  onClick={() => setView(key)}
                  sx={{ borderRadius: 2, mb: 0.5, px: { xs: 1, md: 2 } }}
                >
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: { xs: "0.75rem", md: "1rem" },
                      fontWeight: view === key ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* 右コンテンツ領域 */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* 一般ユーザー */}
          {view === "profile"  && <MyProfile />}
          {view === "orders"   && <MyOrdersPage />}
          {view === "withdraw" && <MyWithdraw />}
          {/* マネージャー */}
          {view === "adminProducts" && <AdminProductList />}
          {view === "adminUsers"    && <AdminUserList />}
          {view === "adminOrders"   && <AdminOrderManagement />}
          {view === "adminSales"   && <AdminSalesStats />}
        </Box>

      </Box>
    </Box>
  );
}

export default MyPage;