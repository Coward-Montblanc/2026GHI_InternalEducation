import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box, Typography, TextField,
  Button, Paper, FormControlLabel,
  Checkbox, Alert, Divider, Grid
} from "@mui/material";
import { useNEEdit } from "../hooks/useNEEdit";
import { LoadingView } from "../components/LoadingCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CommonEditor from "../components/CommonEditor";

const url = import.meta.env.VITE_API_URL;

function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const {
    data, thumbnail, bannerFile, existingImages,
    loading, submitting, error,
    handleChange, handleFileChange, handleSubmit
  } = useNEEdit("event", id);

  const handleEditorChange = (content) => {
    handleChange({ target: { name: "content", value: content } });
  };

  if (!isAdmin) return null;
  if (loading) return <LoadingView />;

  return (
    <>
      <Box sx={{ minHeight: "60vh", p: 4, maxWidth: 1000, margin: "0 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          イベント 編集
        </Typography>
        <Paper elevation={1} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
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
                      {existingImages.thumb ? "サムネイルの変更":"サムネイルの登録"}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumb')} />
                   </Button>
                    {thumbnail && <Typography variant="caption" color="primary">{thumbnail.name}</Typography>}
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
                      {existingImages.banner ? "バナーの変更" : "バナーの登録"}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                    </Button>
                    {bannerFile && <Typography variant="caption" color="secondary">{bannerFile.name}</Typography>}
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth label="タイトル"
              name="title" value={data.title} onChange={handleChange}
              required sx={{ mb: 2 }}
            />
            <CommonEditor 
              label="本文"
              value={data.content} 
              onChange={handleEditorChange} 
              height="450px"
              placeholder="イベントの内容を編集してください。"
            />
            <FormControlLabel
              control={<Checkbox checked={Boolean(data.is_pinned)} name="is_pinned" onChange={handleChange} />}
              label="リストの上部固定"
              sx={{ mb: 2, display: "block" }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
              メインバナー設定
            </Typography>
            
            <FormControlLabel
              control={<Checkbox checked={Boolean(data.is_banner)} onChange={handleChange} />}
              label="メインバナーに公開"
              sx={{ mb: 2 }}
            />

            {Boolean(data.is_banner) && (
              <Box sx={{ mt: 1, p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー開始日時"
                      type="datetime-local"
                      name="banner_start_at"
                      value={data.banner_start_at}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="バナー終了日時"
                      type="datetime-local"
                      name="banner_end_at"
                      value={data.banner_end_at}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: data.banner_start_at }}                      
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth label="露出順（優先順位）"
                      type="number"
                      value={data.banner_priority}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth label="クリック時の移動リンク（オプション）"
                      placeholder="/event/..."
                      value={data.banner_link_url}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "更新中..." : "更新する"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate(`/event/${id}`)}>
                キャンセル
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      <Footer />
    </>
  );
}

export default EventEditPage;
