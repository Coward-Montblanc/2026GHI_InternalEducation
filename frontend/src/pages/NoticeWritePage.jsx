import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box, Typography, TextField, Button, Paper, 
  FormControlLabel, Checkbox, Alert, Divider, Grid, Container
} from "@mui/material";
import { useNEWrite } from "../hooks/useNEWrite";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CommonEditor from "../components/CommonEditor";

function NoticeWritePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const {
    data, thumbnail, bannerFile, error, submitting,
    handleChange, handleFileChange, handleLinkTypeChange, handleSubmit
  } = useNEWrite("notice");

  const handleEditorChange = (content) => {
    handleChange({ target: { name: "content", value: content } });
  };

  useEffect(() => {
    if (!isAdmin) navigate("/notice", { replace: true });
  }, [isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  return (
    <>
      <Container 
        maxWidth={false} disableGutters sx={{ width: '1000px', maxWidth: '1000px', mx: 'auto', mt: 5, mb: 5 }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          お知らせ 新規投稿
        </Typography>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 画像登録 - 常に露出 */}
            <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              画像登録
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: '#fafafa' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>サムネイル</Typography>
                  {thumbnail ? (
                    <Box 
                      component="img" 
                      src={URL.createObjectURL(thumbnail)} 
                      sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mb: 1 }} 
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">画像なし</Typography>
                    </Box>
                  )}

                  <Button variant="contained" component="label" fullWidth startIcon={<PhotoCameraIcon />} size="small">
                    サムネイルを選択
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumb')} />
                  </Button>
                  {thumbnail && <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>{thumbnail.name}</Typography>}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: '#fafafa' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>バナー画像</Typography>
                  {bannerFile ? (
                    <Box 
                      component="img" 
                      src={URL.createObjectURL(bannerFile)} 
                      sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mb: 1 }} 
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">画像なし</Typography>
                    </Box>
                  )}

                  <Button variant="contained" component="label" color="secondary" fullWidth startIcon={<PhotoCameraIcon />} size="small">
                    バナーを選択
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                  </Button>
                  {bannerFile && <Typography variant="caption" color="secondary" sx={{ display: 'block', mt: 0.5 }}>{bannerFile.name}</Typography>}
                </Paper>
              </Grid>
            </Grid>
          </Box>

            <Divider sx={{ my: 3 }} />

            {/* 投稿本文 */}
            <TextField
              fullWidth label="タイトル" name="title"
              value={data.title} onChange={handleChange}
              required sx={{ mb: 2 }}
            />
            <CommonEditor
              fullWidth label="本文" name="content"
              value={data.content} onChange={handleEditorChange}
              required multiline rows={12} sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox name="is_pinned" checked={!!data.is_pinned} onChange={handleChange} />}
              label="トップに固定"
            />

            <Divider sx={{ my: 3 }} />

            {/*バナー露出期間の設定 - チェックボックスをクリックしたときにのみ下部情報を公開する */}
            <FormControlLabel
              control={<Checkbox name="is_banner" checked={!!data.is_banner} onChange={handleChange} />}
              label="メインバナーで公開する"
              sx={{ mb: 2 }}
            />

            {data.is_banner === 1 && (
              <Box sx={{ p: 3, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px solid #e0e0e0", mt: 1 }}>
                <Grid container spacing={3}>
                  {/* 露出期間の設定 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー開始日" type="datetime-local"
                      name="banner_start_at" value={data.banner_start_at}
                      onChange={handleChange} InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー終了日" type="datetime-local"
                      name="banner_end_at" value={data.banner_end_at}
                      onChange={handleChange} InputLabelProps={{ shrink: true }}
                      inputProps={{ min: data.banner_start_at }}
                    />
                  </Grid>
            
                  {/* リンク設定 */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      クリック時のリンク
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            type="radio"
                            checked={data.banner_link_type === "auto"} 
                            onChange={() => handleLinkTypeChange({ target: { value: "auto" } })} 
                          />
                        }
                        label="現在の投稿に自動リンク"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            type="radio" 
                            checked={data.banner_link_type === "manual"} 
                            onChange={() => handleLinkTypeChange({ target: { value: "manual" } })} 
                          />
                        }
                        label="外部リンク直接入力"
                      />
                    </Box>
                    
                    <TextField
                      fullWidth
                      placeholder={data.banner_link_type === "auto" ? "登録後、自動的にリンクが作成されます。" : "https://example.com"}
                      name="banner_link_url"
                      value={data.banner_link_type === "auto" ? "" : data.banner_link_url}
                      onChange={handleChange}
                      disabled={data.banner_link_type === "auto"} // 自動生成時は無効
                      sx={{
                        bgcolor: data.banner_link_type === "auto" ? "#eeeeee" : "white",
                        transition: '0.3s'
                      }}
                      helperText={data.banner_link_type === "auto" ? "この投稿の詳細ページにリンクしています。" : "リンクする完全なURLを入力してください。"}
                    />
                  </Grid>
            
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth label="優先順位（高いほど先順）" type="number"
                      name="banner_priority" value={data.banner_priority}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
              <Button type="submit" variant="contained" disabled={submitting} size="large">
                {submitting ? "送信中..." : "投稿する"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate("/notice")} size="large">
                キャンセル
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}

export default NoticeWritePage;