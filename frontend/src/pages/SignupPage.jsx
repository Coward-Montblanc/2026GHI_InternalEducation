import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SignupPage() {
  const navigate = useNavigate();
  // 1. 入力データを保存する状態(State)生成
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

  // 2. 入力値変更ハンドラー
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. 登録ボタンクリック時にバックエンド呼び出し
  const handleSignup = async () => {
    if (formData.password !== formData.passwordConfirm) {
      alert("パスワードが一致しません。");
      return;
    }

    try {
      // バックエンドURL（ご自身のサーバーポートに合わせて修正してください。例: 5000）
      const response = await axios.post("http://localhost:8080/api/users", {
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
        <TextField fullWidth label="ID*" name="login_id" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="パスワード*" name="password" margin="normal" onChange={handleChange} />
        <TextField fullWidth type="password" label="パスワード確認*" name="passwordConfirm" margin="normal" onChange={handleChange} />
        <TextField fullWidth label="メール*" name="email" margin="normal" onChange={handleChange} />
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