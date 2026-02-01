//유효성검사 아직 안함


import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";

function SignupPage() {
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
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
        >
          회원가입
        </Typography>

        <TextField
          fullWidth
          label="이름*"
          margin="normal"
        />

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

        <TextField
          fullWidth
          type="password"
          label="비밀번호 확인*"
          margin="normal"
        />

        <TextField
          fullWidth
          label="주소"
          margin="normal"
        />

        <TextField
          fullWidth
          label="휴대폰 번호*"
          margin="normal"
        />

        <TextField
          fullWidth
          label="이메일*"
          margin="normal"
        />

        <Typography
          align="center"
        >
        *표시는 필수 입력사항입니다.
        </Typography>


        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >
          가입하기
        </Button>
      </Paper>
    </Box>
  );
}

export default SignupPage;
