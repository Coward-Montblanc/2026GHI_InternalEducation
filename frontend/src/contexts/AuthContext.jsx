import { createContext, useState, useContext, useEffect } from "react";
import { storage } from "../utils/storage"; //토큰 스토리지 함수
import api from "../api/axios";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {//선언과 동시에 실행 (토큰 있는지)
    return storage.get("user"); //스토리지 내에서 없으면 토큰이 없음을 명시함
  });
  
  const verifyPassword = async (password) => { //회원정보 수정용 비밀번호 검증 함수 추가 
    try {
      const response = await api.post("/auth/verify-password", { password });
      return response.data.success;  //200 응답 반환.
    } catch (err) {
      console.error("パスワード検証に失敗しました。 :", err);
      return false; // 실패 시 false
    }
  };

  useEffect(() => {
  const checkToken = async () => {
    if (storage.get("token")) {
      try {
        await api.get("/auth/check"); //백엔드에서 사용
      } catch (err) {
        // 여기서 에러(401)가 나면 인터셉터가 가로채서 로그아웃시킴
      }
    }
  };

  // 30초마다 한 번씩 체크
  const timer = setInterval(checkToken, 30000); 
  return () => clearInterval(timer);
  }, []);

  const login = (userData, token) => {
    storage.set("token", token); //토큰 저장
    storage.set("user", userData); // 유저 이름 등을 저장
    setUser(userData);
  };

  const logout = () => {
    storage.remove("token"); //토큰 삭제
    storage.remove("user"); //유저이름 삭제
    setUser(null);
    window.location.href = "/"; // 로그아웃 시 메인으로 이동
  };

  return (
    <AuthContext.Provider value={{ user, login, logout ,verifyPassword}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);