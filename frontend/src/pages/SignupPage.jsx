import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const url = import.meta.env.VITE_API_URL; //.env파일에서 가져온 url
import { Box, Typography, TextField, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";



function SignupPage() {
  const navigate = useNavigate();
  // 入力データを保存する状態(State)生成
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

  // 入力値変更ハンドラー
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  // 登録ボタンクリック時にバックエンド呼び出し
  const handleSignup = async () => {
    const finalDomain = emailDomain === "custom" ? customDomain : emailDomain; //이메일 도메인부분 직접 입력을 클릭하는지에 따라 바뀜.
    const fullEmail = `${emailId}@${finalDomain}`;
    
    if (!emailId || !finalDomain) { 
      alert("ドメインを選択してください。");
      return;
    }
    if (emailDomain === "custom" && !customDomain) { //도메인을 비우고 가입할 경우
      alert("ドメインを選択または入力してください。");
      return;
    }

    if (!validateFormat(formData.login_id)) { //아이디,비밀번호 제약
      alert("IDは英文と数字を含む4文字以上にしてください。");
      return;
    }
    if (!validateFormat(formData.password)) {
      alert("パスワードは英文と数字を含む4文字以上にしてください。");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert("パスワードが一致しません。");
      return;
    }
    if (!emailId) {
      alert("メールアドレスを入力してください。");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/users`, {
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
        alert("会員登録に成功しました。");
        navigate("/"); // メイン画面に移動
      }
    } catch (error) {
      console.error("会員登録エラー:", error);
      alert(error.response?.data?.message || "サーバーエラーが発生しました。");
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
            戻る
          </Button>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>会員登録</Typography>

        <TextField fullWidth label="名前*" name="name" margin="normal" onChange={handleChange} />
        <TextField
          fullWidth
          label="ID*"
          name="login_id"
          margin="normal"
          onChange={handleChange}
          helperText="英字(a~z)＋数字(0~9)のみ入力可・4文字以上"
        />
        
        <TextField
          fullWidth
          type="password"
          label="パスワード*"
          name="password"
          margin="normal"
          onChange={handleChange}
          helperText="英字(a~z)＋数字(0~9)のみ入力可・4文字以上"
        />
        <TextField fullWidth type="password" label="パスワード確認*" name="passwordConfirm" margin="normal" onChange={handleChange} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, mb: 1 }}> {/*이메일*/}
          <TextField 
            label="メール*" 
            variant="outlined" 
            size="small" 
            sx={{ flex: 1 }} 
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
          <Typography>@</Typography>
          {emailDomain !== "custom" ? (
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>ドメイン</InputLabel>
            <Select 
              value={emailDomain} 
              label="ドメイン"
              onChange={(e) => setEmailDomain(e.target.value)}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="hanmail.net">hanmail.net</MenuItem>
              <MenuItem value="custom">直接入力</MenuItem>
            </Select>
          </FormControl>
          ) : (
              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField 
                label="メール入力*" 
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
                戻る
              </Button>
    </Box>
  )}
        </Box>
        <TextField fullWidth label="電話番号*" name="phone" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="郵便番号" name="zip_code" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="住所" name="address" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="詳細住所" name="address_detail" margin="normal" onChange={handleChange} />

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSignup}>
          登録する
        </Button>
      </Paper>
    </Box>
  );
}

export default SignupPage;