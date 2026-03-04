import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getNotices } from "../services/NoticeService";
import { useNEList } from "../hooks/useNEList";
import NEListTable from "../components/NEListTable";

// 목록 조회·로딩·에러 상태는 useNEList 훅에서 처리 (공지/이벤트 공통)
function NoticePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { items, loading, error } = useNEList(
    getNotices,
    "notices",
    "お知らせの取得に失敗しました。"
  );

  return (
    <>
      <NEListTable
        title="お知らせ"
        emptyMessage="お知らせはありません。"
        items={items}
        idKey="notice_id"
        basePath="/notice"
        error={error}
        loading={loading}
        isAdmin={isAdmin}
        onNavigate={navigate}
      />
      <Footer />
    </>
  );
}

export default NoticePage;
