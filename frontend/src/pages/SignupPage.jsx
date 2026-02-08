import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";



function SignupPage() {
  const navigate = useNavigate();
  // 입력 데이터를 저장할 상태(State) 생성
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

  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [customDomain, setCustomDomain] = useState(""); // 직접 입력한 도메인 저장용

  // 2. 정규식 제약 조건 (영문+숫자 혼합, 4자 이상)
  const validateFormat = (value) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/;
    return regex.test(value);
  };

  // 입력 값 변경 핸들러
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  // 가입 버튼 클릭 시 백엔드 호출
  const handleSignup = async () => {
    const finalDomain = emailDomain === "custom" ? customDomain : emailDomain; //이메일 도메인부분 직접 입력을 클릭하는지에 따라 바뀜.
    const fullEmail = `${emailId}@${finalDomain}`;
    
    if (!emailId || !finalDomain) { 
      alert("도메인을 선택해주세요.");
      return;
    }
    if (emailDomain === "custom" && !customDomain) { //도메인을 비우고 가입할 경우
      alert("도메인을 직접 입력하거나 목록에서 선택해주세요.");
      return;
    }

    if (!validateFormat(formData.login_id)) { //아이디,비밀번호 제약
      alert("아이디는 영문과 숫자를 혼합하여 4자 이상이어야 합니다.");
      return;
    }
    if (!validateFormat(formData.password)) {
      alert("비밀번호는 영문과 숫자를 혼합하여 4자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!emailId) {
      alert("이메일 주소를 입력해주세요.");
      return;
    }

    try {
      // 백엔드 URL
      const response = await axios.post("http://localhost:3000/api/users", {
        login_id: formData.login_id,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        zip_code: formData.zip_code,
        address: formData.address,
        address_detail: formData.address_detail,
        role: formData.role,
        email: fullEmail
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
        <TextField fullWidth label="아이디* 영어(a~z) + 숫자(0~9)만 입력가능. 4글자 이상" name="login_id" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="비밀번호* 영어(a~z) + 숫자(0~9)만 입력가능. 4글자 이상" name="password" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="비밀번호 확인*" name="passwordConfirm" margin="normal" onChange={handleChange} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, mb: 1 }}> {/*이메일*/}
          <TextField 
            label="이메일*" 
            variant="outlined" 
            size="small" 
            sx={{ flex: 1 }} 
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
          <Typography>@</Typography>
          {emailDomain !== "custom" ? (
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>도메인</InputLabel>
            <Select 
              value={emailDomain} 
              label="도메인"
              onChange={(e) => setEmailDomain(e.target.value)}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="hanmail.net">hanmail.net</MenuItem>
              <MenuItem value="custom">직접 입력</MenuItem>
            </Select>
          </FormControl>
          ) : (
              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField 
                label="도메인 입력*" 
                size="small" 
                fullWidth
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  setEmailDomain("naver.com"); // 다시 선택 모드로 복귀
                  setCustomDomain("");
                }}
              >
                뒤로
              </Button>
    </Box>
  )}
        </Box>
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