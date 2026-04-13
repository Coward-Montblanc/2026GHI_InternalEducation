import { Container, TextField, Button, Typography, Box, Paper, MenuItem, Stack } from "@mui/material";
import { useProductAdd } from "../hooks/useProductAdd";
import CommonEditor from "../components/CommonEditor";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

function ProductAddPage() {
  const{
    categories,
    product,
    selectedFiles,
    selectedDetailFiles,
    handleChange,
    handleFileChange,
    handleDetailFileChange,
    handleEditorChange,
    handleSubmit,
  } = useProductAdd();

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PhotoCameraIcon fontSize="small" />
            新規商品登録 (任意, 最大5枚)
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fcfcfc', borderStyle: 'dashed' }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Button
                variant="outlined"
                component="label"
                sx={{
                  width: 100,
                  height: 100,
                  flexDirection: 'column',
                  borderStyle: 'dashed',
                  bgcolor: '#fff'
                }}
              >
                <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>追加</Typography>
                        <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
              </Button>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {selectedFiles.map((file, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: index === 0 ? "2px solid #1976d2" : "1px solid #ddd",
                        boxShadow: index === 0 ? "0 0 8px rgba(25, 118, 210, 0.3)" : "none"
                      }}
                    />
                    {index === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          px: 1,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          borderTopLeftRadius: 6,
                          borderBottomRightRadius: 6
                        }}
                      >
                        代表画像
                     </Box>
                    )}
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      fontSize: '10px', 
                      color: 'text.secondary',
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.name}
                    </Typography>
                  </Box>
                ))}
                {selectedFiles.length === 0 && (
                  <Box sx={{ 
                    width: 100, height: 100, borderRadius: 2, 
                    bgcolor: '#eee', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', border: '1px solid #ddd' 
                  }}>
                    <Typography variant="caption" color="text.secondary">未登録</Typography>
                  </Box>
                )}
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              *最初の画像が商品リストの代表画像になります。 （画像シーケンス注意）
            </Typography>
          </Paper>

          <TextField 
            select 
            fullWidth 
            label="カテゴリー" 
            name="category_id" 
            value={product.category_id || ""} 
            onChange={handleChange} 
            margin="normal"
            required
          >
            {categories.length > 0 ? (
            categories.map((cat) => (
                <MenuItem key={cat.category_id} value={cat.category_id}>
                {cat.name}
                </MenuItem>
            ))
            ) : (
            <MenuItem disabled value="">カテゴリーを読み込み中...</MenuItem>
            )}
            
          </TextField>

          <TextField fullWidth label="商品名" name="name" onChange={handleChange} required margin="normal" />
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>商品詳細説明</Typography>
            <CommonEditor 
                fullWidth
                name="description"
                value={product.description || ""} 
                onChange={handleEditorChange} 
                height="450px"
                placeholder="商品の内容を編集してください。"
              />
          </Box>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="number" label="価格" name="price" onChange={handleChange} required margin="normal" />
            <TextField fullWidth type="number" label="在庫" name="stock" onChange={handleChange} required margin="normal" />
          </Stack>

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhotoCameraIcon fontSize="small" color="secondary" />
              詳細説明用画像 (任意, 最大5枚)
            </Typography>
  
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', borderStyle: 'dashed' }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Button
                  variant="outlined"
                  component="label"
                  color="secondary"
                  sx={{
                    width: 80,
                    height: 80,
                    flexDirection: 'column',
                    borderStyle: 'dashed',
                    bgcolor: '#fff',
                    minWidth: 80
                  }}
                >
                  <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', fontSize: '10px' }}>追加</Typography>
                  <input type="file" hidden multiple accept="image/*" onChange={handleDetailFileChange} />
                </Button>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedDetailFiles.length > 0 ? (
                    selectedDetailFiles.map((file, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={URL.createObjectURL(file)}
                          alt={`detail-preview-${index}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid #ddd",
                            display: 'block'
                          }}
                        />
                        <Box
                          sx={{
                                      position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '9px',
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 4
                          }}
                        >
                          Detail {index + 1}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ 
                      width: 80, height: 80, borderRadius: 1, 
                      bgcolor: '#eee', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', border: '1px solid #ddd' 
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>未登録</Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '11px' }}>
                ※詳細ページ 本体下部に順番に露出される画像です。
              </Typography>
            </Paper>
          </Box>
          <TextField
            select fullWidth label="公開状態" name="status"
            value={product.status} onChange={handleChange}
            margin="normal"
          >
            <MenuItem value={0}>販売中</MenuItem>
            <MenuItem value={1}>販売停止</MenuItem>
            <MenuItem value={2}>品切れ</MenuItem>
          </TextField>


          <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
            商品登録
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProductAddPage;