import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login as loginApi } from "../services/LoginService"; //login 동일 변수가 있어서 loginApi로 이름 변경

function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi(loginId, password);

      // 서버에서 준 토큰과 유저 정보를 컨텍스트에 저장
      login(res.user, res.token);
      
      alert("ログイン成功！");
      navigate("/"); // 메인 페이지로 이동
    } catch (err) {
      alert("ログイン失敗: " + err.response.data.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="ログインID" onChange={(e) => setLoginId(e.target.value)} />
      <input type="password" placeholder="パスワード" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">ログイン</button>
    </form>
  );
}