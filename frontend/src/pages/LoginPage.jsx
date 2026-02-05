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
            戻る
          </Button>
        </Box>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
        >
          ログイン
        </Typography>

        <TextField
          fullWidth
          label="ID*"
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="パスワード*"
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >

{/* ID/パスワード検索ボタンまだありません */}

          ログイン
        </Button>
      </Paper>
    </Box>
  );
}

export default LoginPage;