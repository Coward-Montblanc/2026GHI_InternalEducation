import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, Button, Alert } from "@mui/material";
import { getEventDetail, deleteEvent } from "../services/EventService";
import { useNEDetail } from "../hooks/useNEDetail";
import NEDetailView from "../components/NEDetailView";
import { LoadingView } from "../components/LoadingCircle";

// 상세 조회·삭제·로딩·에러는 useNEDetail 훅에서 처리 (공지/이벤트 공통)
function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { item, loading, error, handleDelete } = useNEDetail(
    id,
    getEventDetail, //hooks로 끌고가서 판단
    deleteEvent,
    {
      listPath: "/event",
      itemKey: "event",
      notFoundMessage: "イベントの取得に失敗しました。",
      confirmMessage: "このイベントを削除しますか？",
    }
  );

  if (loading) { return ( <LoadingView /> ); }

  if (error || !item) {
    return (
      <>
        <Box sx={{ p: 4, maxWidth: 600, margin: "0 auto" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "イベントが見つかりません。"}
          </Alert>
          <Button variant="contained" onClick={() => navigate("/event")}>
            一覧に戻る
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NEDetailView
        item={item}
        basePath="/event"
        id={id}
        isAdmin={isAdmin}
        onDelete={() => handleDelete(navigate)}
        onNavigate={navigate}
      />
      <Footer />
    </>
  );
}

export default EventDetailPage;
