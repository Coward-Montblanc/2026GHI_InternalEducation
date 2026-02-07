import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // 로그인한 유저 정보 저장

  useEffect(() => {
    // 앱이 새로고침되어도 로컬스토리지에 토큰과 유저정보가 있으면 로그인 유지
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token); //토큰 저장
    localStorage.setItem("user", JSON.stringify(userData)); // 유저 이름 등을 저장
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token"); //토큰 삭제
    localStorage.removeItem("user"); //유저이름 삭제
    setUser(null);
    window.location.href = "/"; // 로그아웃 시 메인으로 이동
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);