import { Container, TextField, Button, Typography, Box, Paper, MenuItem, Stack } from "@mui/material";
import { useProductAdd } from "../hooks/useProductAdd";


function ProductAddPage() {
  const{
    categories,
    product,
    selectedFiles,
    selectedDetailFiles,
    handleChange,
    handleFileChange,
    handleDetailFileChange,
    handleSubmit,
  } = useProductAdd();

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          新規商品登録
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* 상품사진 추가(위, 메인 서브)*/}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              商品画像（メイン・サブ）
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              ファイル選択 (最大5枚まで、各250KB制限)
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {selectedFiles.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #ddd" }}
                  />
                ))}
              </Box>
            )}
          </Box>

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
          <TextField fullWidth label="商品説明" name="description" multiline rows={4} onChange={handleChange} margin="normal" />
          
          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="number" label="価格" name="price" onChange={handleChange} required margin="normal" />
            <TextField fullWidth type="number" label="在庫" name="stock" onChange={handleChange} required margin="normal" />
          </Stack>

          <TextField
            select fullWidth label="公開状態" name="status"
            value={product.status} onChange={handleChange}
            margin="normal"
          >
            <MenuItem value={0}>販売中</MenuItem>
            <MenuItem value={1}>販売停止</MenuItem>
            <MenuItem value={2}>品切れ</MenuItem>
          </TextField>

          {/* 상품사진 추가 디테일, 상세사진 */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              詳細画像 (商品詳細ページ用、任意)
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              ファイル選択 (最大5枚まで、各250KB制限)
              <input type="file" hidden multiple accept="image/*" onChange={handleDetailFileChange} />
            </Button>
            
            {/* 선택된 파일 상자로 표시 */}
            {selectedDetailFiles.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {selectedDetailFiles.map((file, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #ddd" }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
            商品登録
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProductAddPage;