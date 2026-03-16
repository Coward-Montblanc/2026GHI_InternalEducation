import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useAddressSelection } from "../hooks/useAddressSelection";
import { LoadingView } from "../components/LoadingCircle";
import AddressSelectModal from '../components/modals/AddressSelectModal';

export default function MyProfile() {
    const {
    isEditing,
    isVerified,      
    confirmInput,  
    setConfirmInput,
    formData,
    error,
    success,
    handleChange,
    handleSave,
    setIsEditing,
    handleVerify,    
    Address,
    cancelEdit,
    setFormData       
  } = useProfile();

  const {
        isAddrModalOpen,
        openAddrModal,
        closeAddrModal,
        handleSelectAddress
    } = useAddressSelection(setFormData);

    
    const { user, loading: authLoading } = useAuth();

    if (authLoading) { return ( <LoadingView /> ); }
      
    if (!user) { return (<Alert severity="warning">ログインが必要です。</Alert>); }

    return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>会員情報</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>情報が正常に更新されました。</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
        {isEditing && !isVerified ? ( //편집버튼 클릭시
          <Box sx={{ py: 8, textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              本人確認のためパスワードを<p/>入力してください
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="パスワードを入力してください"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              sx={{ mb: 3 }}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()} // 엔터키로도 가능
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={cancelEdit}>
                キャンセル
              </Button>
              <Button fullWidth variant="contained" onClick={handleVerify}>
                確認
              </Button>
            </Box>
          </Box>
        ) : ( //비밀번호 일치할경우 편집화면
          <>
            {/* 고정 정보 영역 (ID, 이름, 권한) */}
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 10 }, bgcolor: '#f9f9f9', p: 3, borderRadius: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">ログインID</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.login_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">お名前</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>会員権限</Typography>
                <Chip 
                  label={user.role === "ADMIN" ? "管理者" : "一般会員"} 
                  size="small"
                  color={user.role === "ADMIN" ? "error" : "default"}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* 정보 입력/표시 영역 */}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 수정 모드일 때만 비밀번호 변경 필드 노출 */}
              {isVerified && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>新しいパスワード</Typography>
                    <TextField
                      fullWidth type="password" name="password" size="small"
                      value={formData.password || ''} onChange={handleChange}
                      placeholder="変更する場合のみ入力"
                      InputProps={{ startAdornment: <InputAdornment position="start">🔒</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>パスワード(確認)</Typography>
                    <TextField
                      fullWidth type="password" name="confirmPassword" size="small"
                      value={formData.confirmPassword || ''} onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                </Grid>
              )}

              {/* 공통 연락처/주소 필드 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>メールアドレス</Typography>
                <TextField fullWidth name="email" size="small" value={formData.email} onChange={handleChange} disabled={!isVerified} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>電話番号</Typography>
                <TextField fullWidth name="phone" size="small" value={formData.phone} onChange={handleChange} disabled={!isVerified} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>郵便番号 (7桁)</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    name="zip_code" size="small" value={formData.zip_code || ''} 
                    onChange={handleChange} disabled={!isVerified} sx={{ width: 200 }}
                  />
                  {isVerified && (
                    <>
                    <Button variant="contained" onClick={() => Address(formData.zip_code)}>検索</Button>
                    <Button variant="outlined" onClick={() => openAddrModal(true)}>配送先変更</Button>
							        <AddressSelectModal 
    							        open={isAddrModalOpen}
    							        onClose={closeAddrModal}
    							        onSelect={handleSelectAddress}
							        />
                    </>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>住所</Typography>
                <TextField fullWidth name="address" size="small" value={formData.address} onChange={handleChange} disabled={!isVerified} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>詳細住所</Typography>
                <TextField fullWidth name="address_detail" size="small" value={formData.address_detail} onChange={handleChange} disabled={!isVerified} />
              </Box>

              {/* 하단 버튼 제어 */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                {!isVerified ? (
                  <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ px: 4, py: 1, fontWeight: 700 }}>編集</Button>
                ) : (
                  <>
                    <Button variant="text" color="inherit" onClick={cancelEdit}>キャンセル</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ px: 4, py: 1, fontWeight: 700 }}>変更</Button>
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
