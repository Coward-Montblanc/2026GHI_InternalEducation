import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SignupPage() {
  const navigate = useNavigate();
  // 1. 입력 데이터를 저장할 상태(State) 생성
  const [formData, setFormData] = useState({
    login_id: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    address: "",
    address_detail: "",
    role: "USER"
  });

  // 2. 입력 값 변경 핸들러
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. 가입 버튼 클릭 시 백엔드 호출
  const handleSignup = async () => {
    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 백엔드 URL (본인의 서버 포트에 맞게 수정하세요. 예: 5000)
      const response = await axios.post("http://localhost:3000/api/users", {
        login_id: formData.login_id,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        zip_code: formData.zip_code,
        address: formData.address,
        address_detail: formData.address_detail,
        role: formData.role
      });

      if (response.status === 201) {
        alert("회원가입 성공!");
        navigate("/"); // 메인 화면으로 이동
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert(error.response?.data?.message || "서버 에러가 발생했습니다.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
      <Paper elevation={3} sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ p: 0, minWidth: "auto" }}
          >
            뒤로
          </Button>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>회원가입</Typography>

        <TextField fullWidth label="이름*" name="name" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="아이디*" name="login_id" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="비밀번호*" name="password" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="비밀번호 확인*" name="passwordConfirm" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="이메일*" name="email" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="전화번호*" name="phone" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="우편번호" name="zip_code" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="주소" name="address" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="상세주소" name="address_detail" margin="normal" onChange={handleChange} />

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSignup}>
          가입하기
        </Button>
      </Paper>
    </Box>
  );
}

export default SignupPage;