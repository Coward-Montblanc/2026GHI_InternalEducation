import { useNavigate } from "react-router-dom";
import {  Modal, Box, Typography, TextField, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSignup } from "../hooks/useSignup";
import Flags from 'country-flag-icons/react/3x2';

function SignupPage() {
  const {
    formData, emailId, setEmailId, emailDomain, setEmailDomain,
    customDomain, setCustomDomain, emailDomains, open, setOpen, errors, setErrors,
    handleChange, Address, handleSignup,countryCodes, 
    selectedCountry, setSelectedCountry ,getCountryCode,
    phonePlaceholder, handlePhoneChange, handleEmailIdChange, handleEmailDomainChange,
  } = useSignup();
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

        <TextField 
          fullWidth 
          label="Name*" 
          name="name" 
          margin="normal" 
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          fullWidth
          label="ID*"
          name="login_id"
          margin="normal"
          onChange={handleChange}
          error={!!errors.login_id}
          helperText={errors.login_id}
        />
        
        <TextField
          fullWidth
          type="password"
          label="パスワード*"
          name="password"
          margin="normal"
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField 
          fullWidth
          type="password" 
          label="パスワード確認*" 
          name="passwordConfirm" 
          margin="normal" 
          onChange={handleChange} 
          onBlur={() => {
          if (formData.password !== formData.passwordConfirm) {
            setErrors(prev => ({ ...prev, passwordConfirm: "パスワードが一致しません。" }));
            }
          }}
          error={!!errors.passwordConfirm}
          helperText={errors.passwordConfirm} 
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, mb: 1 }}> {/*Eメール*/}
          <TextField 
            label="メール*" 
            variant="outlined" 
            size="small" 
            sx={{ flex: 1 }} 
            value={emailId}
            onChange={(e) => handleEmailIdChange(e.target.value)}
            error={!!errors.email}
            helperText={errors.email} 
          />
          <Typography>@</Typography>
          {emailDomain !== "custom" ? (
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>ドメイン</InputLabel>
            <Select 
              value={emailDomain} 
              label="ドメイン"
              onChange={(e) => handleEmailDomainChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>ドメイン選択</MenuItem>
              {emailDomains?.map((domain) => (
                <MenuItem key={domain.value} value={domain.value}>
                  {domain.value}
                </MenuItem>
              ))}
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
                  setEmailDomain("");
                  setCustomDomain("");
                }}
              >
                戻る
              </Button>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {/* 国コードの選択ドロップダウン */}
        <FormControl sx={{ width: 120 }} size="small">
          <InputLabel>国家</InputLabel>
          <Select
            value={selectedCountry}
            label="国家"
            onChange={(e) => setSelectedCountry(e.target.value)}
            renderValue={(value) => <strong>{value}</strong>} 
          >
          {countryCodes?.map((item) => {
            const countryCode = getCountryCode(item.value); // 例 +82 -> KR
            const FlagIcon = Flags[countryCode]; // 国コードに合った国旗イメージ

            return (
              //国旗が検索されない場合は、地球に出力
              <MenuItem key={item.value} value={item.value} sx={{ display: 'flex', gap: 1 }}>
                {FlagIcon ? <FlagIcon title={countryCode} style={{ width: '20px' }} /> : '🌐'} 
                {item.label}
              </MenuItem>
            );
          })}
          </Select>
        </FormControl>

        {/* 電話番号入力 */}
        <TextField
          fullWidth
          label="電話番号*"
          name="phone"
          size="small"
          placeholder={phonePlaceholder}
          onChange={handlePhoneChange}
          value={formData.phone}
          inputProps={{ 
            inputMode: 'numeric', 
            pattern: '[0-9]*' 
          }}
          error={!!errors.phone}
          helperText={errors.phone}
        />
        </Box>
        {/* 郵便番号と検索ボタン */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
          <TextField 
        		label="郵便番号" 
        		name="zip_code" 
        		value={formData.zip_code || ''}
						onChange={handleChange}
            error={!!errors.zip_code}
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