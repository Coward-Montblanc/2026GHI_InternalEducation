//유효성검사 아직 안함


import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function LoginPage() {
  const navigate = useNavigate();
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
            sx={{ p: 0, minWidth: "auto" }}
          >
            뒤로
          </Button>
        </Box>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
        >
          로그인
        </Typography>

        <TextField
          fullWidth
          label="아이디*"
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="비밀번호*"
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >

{/* 아이디/비밀번호 찾기 버튼 아직 없음 */}

          로그인
        </Button>
      </Paper>
    </Box>
  );
}

export default LoginPage;
