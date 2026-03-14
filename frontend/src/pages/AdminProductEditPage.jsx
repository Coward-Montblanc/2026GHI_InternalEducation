import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, TextField, Button, Typography,
  Box, Paper, MenuItem, Stack, CircularProgress, Alert,
} from "@mui/material";
import { getCategories } from "../services/CategoryService";
import { getProductById, updateProduct } from "../services/ProductService";
import { useProductFiles } from "../hooks/useProductAdd";

function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({ category_id: "", name: "", description: "", price: "", stock: "", status: 0 });
  const [existingImages, setExistingImages] = useState([]);
  const [existingDetailImages, setExistingDetailImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedFiles, selectedDetailFiles, handleFileChange, handleDetailFileChange } = useProductFiles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, productData] = await Promise.all([
          getCategories(),
          getProductById(id),
        ]);
        setCategories(catData);

        const p = productData;
        setProduct({
          category_id: p.category_id ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          stock: p.stock ?? "",
          status: p.status ?? 0,
        });
        setExistingImages((p.images ?? []).filter((img) => img.role === 1 || img.role === 2));
        setExistingDetailImages((p.images ?? []).filter((img) => img.role === 3));
      } catch (err) {
        setError("商品データの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_id", product.category_id);
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("status", product.status);

    selectedFiles.forEach((file) => formData.append("images", file));
    selectedDetailFiles.forEach((file) => formData.append("detail_images", file));

    try {
      const res = await updateProduct(id, formData);
      if (res.success) {
        alert("商品が修正されました。");
        navigate("/mypage");
      }
    } catch (err) {
      alert("修正中にエラーが発生しました。");
      console.error(err);
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Alert severity="error">{error}</Alert>
      <Button sx={{ mt: 2 }} onClick={() => navigate("/mypage")}>戻る</Button>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          商品修正
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* 메인·서브 이미지 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>商品画像（メイン・サブ）</Typography>

            {/* 기존 이미지 미리보기 */}
            {existingImages.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {existingImages.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={`${url}${img.image_url}`}
                    alt={`既存画像${i + 1}`}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #ddd" }}
                  />
                ))}
              </Box>
            )}

            <Button variant="outlined" component="label" fullWidth>
              ファイル選択 (最大5枚まで、各250KB制限)
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {selectedFiles.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {selectedFiles.map((file, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #ddd" }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* 카테고리 */}
          <TextField
            select fullWidth label="カテゴリー" name="category_id"
            value={product.category_id} onChange={handleChange}
            margin="normal" required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.category_id} value={cat.category_id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          {/* 상품명 */}
          <TextField fullWidth label="商品名" name="name" value={product.name} onChange={handleChange} required margin="normal" />

          {/* 상품설명 */}
          <TextField fullWidth label="商品説明" name="description" value={product.description} onChange={handleChange} multiline rows={4} margin="normal" />

          {/* 가격·재고 */}
          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="number" label="価格" name="price" value={product.price} onChange={handleChange} required margin="normal" />
            <TextField fullWidth type="number" label="在庫" name="stock" value={product.stock} onChange={handleChange} required margin="normal" />
          </Stack>

          {/* 공개 상태 */}
          <TextField
            select fullWidth label="公開状態" name="status"
            value={product.status} onChange={handleChange}
            margin="normal"
          >
            <MenuItem value={0}>販売中</MenuItem>
            <MenuItem value={1}>販売停止</MenuItem>
            <MenuItem value={2}>品切れ</MenuItem>
          </TextField>

          {/* 상세 이미지 */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>詳細画像（任意）</Typography>

            {/* 기존 상세 이미지 미리보기 */}
            {existingDetailImages.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {existingDetailImages.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={`${url}${img.image_url}`}
                    alt={`既存詳細画像${i + 1}`}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #ddd" }}
                  />
                ))}
              </Box>
            )}

            <Button variant="outlined" component="label" fullWidth>
              ファイル選択 (最大5枚まで、各250KB制限)
              <input type="file" hidden multiple accept="image/*" onChange={handleDetailFileChange} />
            </Button>
            {selectedDetailFiles.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {selectedDetailFiles.map((file, i) => (
                  <Box
                    key={i}
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
            変更を保存
          </Button>

        </Box>
      </Paper>
    </Container>
  );
}

export default AdminProductEditPage;
