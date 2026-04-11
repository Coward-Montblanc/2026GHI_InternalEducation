import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box, Typography, TextField,
  Button, Paper, FormControlLabel,
  Checkbox, Alert, Divider, Grid, Container
} from "@mui/material";
import { useNEEdit } from "../hooks/useNEEdit";
import { LoadingView } from "../components/LoadingCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CommonEditor from "../components/CommonEditor";

const url = import.meta.env.VITE_API_URL;

function NoticeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const {
    data, thumbnail, bannerFile, existingImages,
    loading, submitting, error,
    handleChange, handleFileChange, handleSubmit
  } = useNEEdit("notice", id);

  const handleEditorChange = (content) => {
    handleChange({ target: { name: "content", value: content } });
  };

  if (!isAdmin) return null;
  if (loading) return <LoadingView />;

  return (
    <>
      <Container 
        maxWidth={false} disableGutters sx={{ width: '1000px', maxWidth: '1000px', mx: 'auto', mt: 5, mb: 5 }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          お知らせ 編集
        </Typography>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                画像管理
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>サムネイル</Typography>
                    {(thumbnail || existingImages.thumb) ? (
                      <Box 
                        component="img" 
                        src={thumbnail ? URL.createObjectURL(thumbnail) : `${url}/uploads/${existingImages.thumb}`} 
                        sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mb: 1 }} 
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">画像なし</Typography>
                      </Box>
                    )}
                    <Button variant="contained" component="label" fullWidth startIcon={<PhotoCameraIcon />} size="small">
                      {existingImages.thumb ? "サムネイルの変更" : "サムネイルの登録"}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumb')} />
                    </Button>
                    {thumbnail && <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>{thumbnail.name}</Typography>}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>バナー画像</Typography>
                    {(bannerFile || existingImages.banner) ? (
                      <Box 
                        component="img" 
                        src={bannerFile ? URL.createObjectURL(bannerFile) : `${url}/uploads/${existingImages.banner}`} 
                        sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mb: 1 }} 
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">画像なし</Typography>
                      </Box>
                    )}
                    <Button variant="contained" component="label" color="secondary" fullWidth startIcon={<PhotoCameraIcon />} size="small">
                      {existingImages.banner ? "バナーの変更" : "バナー의 登録"}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                    </Button>
                    {bannerFile && <Typography variant="caption" color="secondary" sx={{ display: 'block', mt: 0.5 }}>{bannerFile.name}</Typography>}
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <TextField
              fullWidth label="タイトル" name="title"
              value={data.title} onChange={handleChange}
              required sx={{ mb: 2 }}
            />
            
            <CommonEditor 
              value={data.content} 
              onChange={handleEditorChange} 
              placeholder="お知らせの内容を編集してください。"
            />

            <FormControlLabel
              control={<Checkbox checked={Boolean(data.is_pinned)} name="is_pinned" onChange={handleChange} />}
              label="トップに固定"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 3 }} />

            <FormControlLabel
              control={<Checkbox checked={Boolean(data.is_banner)} name="is_banner" onChange={handleChange} />}
              label="メインバナーで公開する"
              sx={{ mb: 2 }}
            />

            {Boolean(data.is_banner) && (
              <Box sx={{ p: 3, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px solid #e0e0e0", mt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー開始日時" type="datetime-local"
                      name="banner_start_at" value={data.banner_start_at}
                      onChange={handleChange} InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー終了日時" type="datetime-local"
                      name="banner_end_at" value={data.banner_end_at}
                      onChange={handleChange} InputLabelProps={{ shrink: true }}
                      inputProps={{ min: data.banner_start_at }}                      
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth label="優先順位" type="number"
                      name="banner_priority" value={data.banner_priority}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth label="クリック時のリンク URL"
                      name="banner_link_url" value={data.banner_link_url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
              <Button type="submit" variant="contained" disabled={submitting} size="large">
                {submitting ? "更新中..." : "更新する"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate(`/notice/${id}`)} size="large">
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

export default NoticeEditPage;
