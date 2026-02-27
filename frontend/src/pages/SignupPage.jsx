import { useNavigate } from "react-router-dom";
import {  Modal, Box, Typography, TextField, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSignup } from "../hooks/useSignup";


function SignupPage() {
  const {
    formData, emailId, setEmailId, emailDomain, setEmailDomain,
    customDomain, setCustomDomain, open, setOpen,
    handleChange, Address, handleSignup 
  } = useSignup(); //임포트해서 리턴한 객체들 가져옴
  const navigate = useNavigate();
  
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

        <TextField fullWidth label="Name*" name="name" margin="normal" onChange={handleChange} />
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
        {/* 우편번호와 검색 버튼 */}
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
      <TextField 
        							label="郵便番号" 
        							name="zip_code" 
        							value={formData.zip_code || ''}
									onChange={handleChange}
									placeholder="1234567"
      							/>
      							<Button variant="contained"
										onClick={() => Address(formData.zip_code)}>
        							住所検索
      							</Button>
    </Box>

    <TextField 
      fullWidth 
      label="住所" 
      name="address" 
      value={formData.address || ''} 
      margin="normal" 
      InputProps={{ readOnly: true }} 
    />

    <TextField 
      fullWidth 
      label="詳細住所" 
      name="address_detail" 
      margin="normal" 
      onChange={handleChange} 
    />

    <Modal open={open} onClose={() => setOpen(false)}>
      <Box sx={{ 
        position: 'absolute', top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 1 
      }}>
      </Box>
    </Modal>

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSignup}>
          登録する
        </Button>
      </Paper>
    </Box>
  );
}

export default SignupPage;