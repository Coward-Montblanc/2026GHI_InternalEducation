import { createContext, useState, useContext, useEffect } from "react";
import { storage } from "../utils/storage";
import api from "../api/axios";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return storage.get("user"); 
  });
  
  const verifyPassword = async (password) => {  
    try {
      const response = await api.post("/auth/verify-password", { password });
      return response.data.success; 
    } catch (err) {
      console.error("パスワード検証に失敗しました。 :", err);
      return false;
    }
  };

  useEffect(() => {
  const checkToken = async () => {
    if (storage.get("token")) {
      try {
        await api.get("/auth/check");
      } catch (err) {
        //ここでエラー401が発生すると、インターセプタが傍受されてログアウトします。
      }
    }
  };

  // 30秒ごとに1回チェック
  const timer = setInterval(checkToken, 30000); 
  return () => clearInterval(timer);
  }, []);

  const login = (userData, token) => {
    storage.set("token", token);
    storage.set("user", userData);
    setUser(userData);
  };

  const logout = () => {
    storage.remove("token");
    storage.remove("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout ,verifyPassword}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);