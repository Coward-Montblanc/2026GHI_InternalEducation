import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        login_id: loginId,
        password: password
      });

      // 서버에서 준 토큰과 유저 정보를 컨텍스트에 저장
      login(res.data.user, res.data.token);
      
      alert("로그인 성공!");
      navigate("/"); // 메인 페이지로 이동
    } catch (err) {
      alert("로그인 실패: " + err.response.data.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="아이디" onChange={(e) => setLoginId(e.target.value)} />
      <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">ログイン</button>
    </form>
  );
}