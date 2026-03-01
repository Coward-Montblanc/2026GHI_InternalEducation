import { useState , useEffect , useRef} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 임포트
import { loginApi } from "../services/LoginService"; 

export const useLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasAlerted = useRef(false); //세션 만료 중복 방지
  const { login } = useAuth(); // Context에서 login 함수 가져오기

  // 입력값을 저장할 상태(State)
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 에러 메시지 상태

  useEffect(() => { //세션이 만료되어 이동되었을 경우
    const params = new URLSearchParams(location.search);
    if (params.get('exp') === 'true' && !hasAlerted.current) { //알림창 띄움 여부로 판별
      hasAlerted.current = true;

      alert("セッションが期限切れです。再度ログインしてください。");

      navigate('/login', { replace: true });
    }
  }, [location, navigate]);


  // 로그인 버튼 클릭 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 에러 초기화

    try {
      const res = await loginApi(loginId, password);
      login(res.user, res.token);
      alert(`${res.user.name}様、ようこそ！`);
      navigate("/"); // 메인 페이지로 이동
    } catch (err) {
      // 실패 시: 에러 메시지 표시
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