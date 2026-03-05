import { useState, useEffect } from "react";
import { Box, Paper, List, ListItemButton, ListItem, ListItemText } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { LoadingView } from "../components/LoadingCircle";
import MyWithdraw from "./MyWithdraw"
import MyOrdersPage from "./MyOrdersPage"; // 가져오기
import MyProfile from "./MyProfile";


function MyPage() {
  const [view, setView] = useState("profile");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: { xs: 1, md: 3 } }}>
        
        {/* [좌측 사이드바 */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width: { xs: "100px", sm: "180px", md: "240px" }, 
            flexShrink: 0, //
            borderRadius: 4,
            position: "sticky", 
            top: 20,
            overflow: "hidden",
          }}
        >
          <List sx={{ p: 1 }}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={view === "profile"} 
                onClick={() => setView("profile")}
                sx={{ borderRadius: 2, mb: 1, px: { xs: 1, md: 2 } }}
              >
                <ListItemText 
                  primary="会員情報" 
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.75rem', md: '1rem' },
                    fontWeight: view === "profile" ? 700 : 500 
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={view === "orders"} 
                onClick={() => setView("orders")}
                sx={{ borderRadius: 2, px: { xs: 1, md: 2 } }}
              >
                <ListItemText 
                  primary="注文履歴" 
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.75rem', md: '1rem' },
                    fontWeight: view === "orders" ? 700 : 500 
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={view === "withdraw"} 
                onClick={() => setView("withdraw")}
                sx={{ borderRadius: 2, mb: 1, px: { xs: 1, md: 2 } }}
              >
                <ListItemText 
                  primary="会員脱退" 
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.75rem', md: '1rem' },
                    fontWeight: view === "withdraw" ? 700 : 500 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>

        {/* [2] 우측 컨텐츠 영역 (확장) */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {view === "profile" && <MyProfile />}
          {view === "orders" && <MyOrdersPage />}
          {view === "withdraw" && <MyWithdraw />} {/* 내부 컴포넌트 호출 */}
        </Box>
        
      </Box>
    </Box>
  );
}

export default MyPage;