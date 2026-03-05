import { useNavigate } from "react-router-dom";
import api from "axios";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../utils/storage";

export const useWithdraw = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // AuthContext에 로그아웃 함수가 있다고 가정
  const url = import.meta.env.VITE_API_URL;
  const withdraw = async () => {
    try {
      await api.put(`${url}/api/users/update-profile`, { status: 1 }, {
      headers: { Authorization: `Bearer ${storage.get("token")}` },
    });

      logout(); 
      alert("会員退会が完了しました。");
      navigate("/");
    } catch (err) {
      console.error("会員退会中のエラー:", err);
      alert(err.response?.data?.message || "会員退会中にエラーが発生しました。");
    }
  };

  return { withdraw };
};