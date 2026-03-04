import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getEvents } from "../services/EventService";
import { useNEList } from "../hooks/useNEList";
import NEListTable from "../components/NEListTable";

// 목록 조회·로딩·에러 상태는 useNEList 훅에서 처리 (공지/이벤트 공통)
function EventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { items, loading, error } = useNEList(
    getEvents,
    "events",
    "イベントの取得に失敗しました。"
  );

  return (
    <>
      <NEListTable
        title="イベント"
        emptyMessage="イベントはありません。"
        items={items}
        idKey="event_id"
        basePath="/event"
        error={error}
        loading={loading}
        isAdmin={isAdmin}
        onNavigate={navigate}
      />
      <Footer />
    </>
  );
}

export default EventPage;
