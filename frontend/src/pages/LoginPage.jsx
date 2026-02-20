import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 임포트
import { loginApi } from "../services/LoginService"; 
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Context에서 login 함수 가져오기

  // 입력값을 저장할 상태(State)
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 에러 메시지 상태

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 400,
          p: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ p: 0, minWidth: "auto", textTransform: "none" }}
          >
            戻る
          </Button>
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
          ログイン
        </Typography>

        {/* 에러 발생 시 알림창 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ID"
            margin="normal"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />

          <TextField
            fullWidth
            type="password"
            label="パスワード"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            fullWidth
            type="submit" // form의 onSubmit을 실행시킴
            variant="contained"
            size="large"
            sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
          >
            ログイン
          </Button>
        </form>

        {/* 추가 기능 버튼들 */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
          <Button variant="text" size="small" color="inherit">IDのお忘れの方</Button>
          <Typography sx={{ color: "#ccc" }}>|</Typography>
          <Button variant="text" size="small" color="inherit">パスワードのお忘れの方</Button>
          <Typography sx={{ color: "#ccc" }}>|</Typography>
          <Button 
            variant="text" 
            size="small" 
            color="primary"
            onClick={() => navigate("/signup")} // 회원가입 페이지 이동
          >
            会員登録
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;