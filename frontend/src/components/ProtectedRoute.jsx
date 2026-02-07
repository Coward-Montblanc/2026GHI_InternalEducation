import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
    alert("로그인이 필요한 서비스입니다.");
    return <Navigate to="/login" replace />;
  }

  return children;
}