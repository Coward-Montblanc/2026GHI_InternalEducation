import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, TextField, Button, Typography,
  Box, Paper, MenuItem, Stack, CircularProgress, Alert,
} from "@mui/material";
import { getCategories } from "../services/CategoryService";
import { getProductById, updateProduct } from "../services/ProductService";
import { useProductFiles } from "../hooks/useProductAdd";
import CommonEditor from "../components/CommonEditor";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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

  const handleEditorChange = (content) => {
  setProduct((prev) => {
    if (prev.description === content) return prev;
    return { ...prev, description: content };
  });
  };

  const statusTagStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bgcolor: 'rgba(0,0,0,0.6)',
  color: 'white',            
  padding: '2px 6px',      
  fontSize: '10px',          
  fontWeight: 'bold',         
  borderTopLeftRadius: 4,     
  borderBottomRightRadius: 4,
  zIndex: 1                  
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, productRes] = await Promise.all([
          getCategories(),
          getProductById(id),
        ]);
        if (catRes && catRes.success) {
          setCategories(catRes.categories); 
        }else if (Array.isArray(catRes)) {
        setCategories(catRes);
        }

        if (productRes && productRes.success) {
        const p = productRes.response_p;

        setProduct({
          category_id: p.category_id ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          stock: p.stock ?? "",
          status: p.status ?? 0,
        });

        const images = p.images ?? [];
        setExistingImages(images.filter((img) => img.role === 1 || img.role === 2));
        setExistingDetailImages(images.filter((img) => img.role === 3));
      }
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
        navigate("/mypage", { replace: true });
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

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fcfcfc', borderStyle: 'dashed', mb: 3 }}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button variant="outlined" component="label" sx={{ width: 100, height: 100, flexDirection: 'column', borderStyle: 'dashed', bgcolor: '#fff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>追加</Typography>
                  <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                </Button>

                {existingImages.map((img, i) => (
                  <Box key={`ex-main-${i}`} sx={{ position: 'relative' }}>
                    <Box 
                      component="img" 
                      src={`${url}${img.image_url}`} 
                      sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 2, border: "1px solid #1976d2" }} 
                    />
                    <Box sx={statusTagStyle}>既存</Box>
                  </Box>
                ))}

                {selectedFiles.map((file, i) => (
                  <Box key={`new-main-${i}`} sx={{ position: 'relative' }}>
                    <Box 
                      component="img" 
                      src={URL.createObjectURL(file)} 
                      sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 2, border: "1px solid #4caf50" }} 
                    />
                    <Box sx={{ ...statusTagStyle, bgcolor: "#4caf50" }}>NEW</Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

          <TextField
            select fullWidth label="カテゴリー" name="category_id"
            value={product.category_id} onChange={handleChange}
            margin="normal" required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.category_id} value={cat.category_id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="商品名" name="name" value={product.name} onChange={handleChange} required margin="normal" />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>商品説明</Typography>
            <CommonEditor 
              value={product.description || ""} 
              onChange={handleEditorChange} 
              height="400px"
            />
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="number" label="価格" name="price" value={product.price} onChange={handleChange} required margin="normal" />
            <TextField fullWidth type="number" label="在庫" name="stock" value={product.stock} onChange={handleChange} required margin="normal" />
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

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhotoCameraIcon fontSize="small" color="secondary" />
              詳細説明用画像 (任意, 最大5枚)
            </Typography>
  
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', borderStyle: 'dashed' }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
                <Button
                  variant="outlined"
                  component="label"
                  color="secondary"
                  sx={{ width: 80, height: 80, flexDirection: 'column', borderStyle: 'dashed', bgcolor: '#fff', minWidth: 80 }}
                >
                  <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', fontSize: '10px' }}>追加</Typography>
                  <input type="file" hidden multiple accept="image/*" onChange={handleDetailFileChange} />
                </Button>
                {existingDetailImages.map((img, i) => (
                  <Box key={`ex-detail-${i}`} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={`${url}${img.image_url}`}
                      sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #9c27b0" }}
                    />
                    <Box sx={statusTagStyle}>既存</Box>
                  </Box>
                ))}
                {selectedDetailFiles.map((file, index) => (
                  <Box key={`new-detail-${index}`} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #4caf50" }}
                    />
                    <Box sx={{ ...statusTagStyle, bgcolor: "#4caf50" }}>NEW</Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
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
