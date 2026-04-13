import { useState , useEffect , useRef} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginApi } from "../services/LoginService"; 

export const useLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasAlerted = useRef(false); //セッションの有効期限の重複防止
  const { login } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { //セッションが期限切れになって移動された場合
    const params = new URLSearchParams(location.search);
    if (params.get('exp') === 'true' && !hasAlerted.current) {
      hasAlerted.current = true;
      alert("セッションが期限切れです。再度ログインしてください。");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  //ログインボタンクリックハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginApi(loginId, password);
      login(res.user, res.token);
      alert(`${res.user.name}様、ようこそ！`);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "ログイン中にエラーが発生しました。";
      setError(message);
    }
  };

  return{
    navigate,
    loginId,setLoginId,
    password,setPassword,
    error,
    handleSubmit,
  };
};