import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  //const [user, setUser] = useState(null); // 로그인한 유저 정보 저장
  //const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [user, setUser] = useState(() => {//선언과 동시에 실행 (토큰 있는지)
    const savedUser = localStorage.getItem("user"); //있으면 그대로
    return savedUser ? JSON.parse(savedUser) : null; //없으면 null로 바꿔주면서 토큰이 없음을 명시함
  });

  
  /*useEffect(() => {
    // 앱이 새로고침되어도 로컬스토리지에 토큰과 유저정보가 있으면 로그인 유지
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);*/
//여기부터 해야함
  useEffect(() => {
  const checkToken = async () => {
    if (localStorage.getItem("token")) {
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