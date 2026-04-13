import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getNotices } from "../services/NoticeService";
import { useNEList } from "../hooks/useNEList";
import NEListTable from "../components/NEListTable";
import { Box, Container, Typography, Paper, Divider, Button, Stack } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { LoadingView } from "../components/LoadingCircle";

function NoticePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { items, loading, error } = useNEList(
    getNotices,
    "notices",
    "お知らせの取得に失敗しました。"
  );

  const handleLogout = async () => {
    try {
      await logout();
      alert("ログアウトしました。");
      navigate("/notice");
    } catch (err) {
      console.error("ログアウトしました。エラー:", err);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 10 }}>
      <Box sx={{ bgcolor: "primary.main", color: "#fff", py: 6, mb: 4 }}>
        <Container maxWidth={false} sx={{ maxWidth: "1000px" }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            spacing={2}
          >

          <Stack direction="row" alignItems="center" spacing={2}>
            <NotificationsIcon sx={{ fontSize: 40 }} />
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>お知らせ</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
            ByeMartの新しい投稿をチェックしてください。
            </Typography>
            </Box>
          </Stack>

          {user && (
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="contained" 
              disableElevation
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                borderRadius: "20px",
                px: 3
              }}
            onClick={() => navigate("/mypage")}
            >
            マイページ
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                color: "#fff", 
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255, 255, 255, 0.1)" },
                borderRadius: "20px",
                px: 3
              }}
              onClick={handleLogout}
            >
            ログアウト
            </Button>
          </Stack>
          )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: "1000px" }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: { xs: 1, md: 2 }, 
            borderRadius: 3, 
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            bgcolor: "#fff",
            minHeight: "500px",
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, pr: 2 }}>
              <Button variant="contained" onClick={() => navigate("/notice/write")}>新規作成</Button>
            </Box>
          )}
          {loading ? ( <LoadingView />
              ) : items.length > 0 ? (
                <NEListTable
                  items={items}
                  idKey="notice_id"
                  basePath="/notice"
                  error={error}
                  loading={loading}
                  isAdmin={isAdmin}
                  onNavigate={navigate}
                />
              ) : (
                <Box 
                  sx={{ 
                    flexGrow: 1,
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 5 
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 80, color: "#e0e0e0", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    現在、登録されているお知らせはありません。
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2, borderRadius: '10px' }} 
                    onClick={() => navigate("/")}
                  >
                    ホームへ戻る
                  </Button>
                </Box>
              )}
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}

export default NoticePage;
