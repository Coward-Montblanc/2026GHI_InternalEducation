import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLogin } from "../hooks/useLogin";

function LoginPage() {
  const{
    navigate,
    loginId,setLoginId,
    password,setPassword,
    error,
    handleSubmit,
  } =useLogin();

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