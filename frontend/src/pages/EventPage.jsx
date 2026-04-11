import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getEvents } from "../services/EventService";
import { useNEList } from "../hooks/useNEList";
import NEListTable from "../components/NEListTable";
import { Box, Container, Typography, Paper, Divider, Button, Stack } from "@mui/material";
import EventIcon from '@mui/icons-material/Event'; 
import { LoadingView } from "../components/LoadingCircle";

function EventPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { items, loading, error } = useNEList(
    getEvents,
    "events",
    "イベントの取得に失敗しました。"
  );

  const handleLogout = async () => {
    try {
      await logout();
      alert("ログアウトしました。");
      navigate("/event");
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
            <EventIcon sx={{ fontSize: 40 }} />
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>イベント</Typography>
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
            p: { xs: 2, md: 4 }, 
            borderRadius: 3, 
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            bgcolor: "#fff",
            minHeight: "400px",
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" onClick={() => navigate("/event/write")}>新規作成</Button>
            </Box>
          )}
          {loading ? ( <LoadingView />
              ) : items.length > 0 ? (
                <NEListTable
                  items={items}
                  idKey="event_id"
                  basePath="/event"
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
                  <EventIcon sx={{ fontSize: 80, color: "#e0e0e0", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    現在、登録されているイベントはありません。
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

export default EventPage;
