import { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box, Paper, MenuItem, Stack, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import api from "../api/axios";


function ProductAddPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  
  
  // 파일 상태 관리 (배열)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/categories");
        setCategories(res.data);
        if (res.data.length > 0) {
          setProduct(prev => ({ ...prev, category_id: res.data[0].category_id }));
        }
      } catch (err) {
        console.error("カテゴリー読み込み失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  
  const handleChange = (e) => {
    if(e.target.files){
      const newfile = Array.from(e.target.file);

    }
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => { // 파일 선택 시 호출되는 함수
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const MAX_SIZE = 250 * 1024; // 250KB
      const MAX_COUNT = 5;

      
      if (selectedFiles.length + newFiles.length > MAX_COUNT) { // 개수 체크
        alert(`이미지는 최대 ${MAX_COUNT}장까지만 업로드 가능합니다.`);
        e.target.value = ""; 
        return;
      }

      for (let file of newFiles) { // 용량확인
        if (file.size > MAX_SIZE) {
          alert(`용량이 250KB를 초과합니다.`);
          e.target.value = "";
          return;
        }
      }
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      e.target.value = "";// 연속해서 같은 파일을 선택할 수 있도록 인풋 초기화
    }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  
  // product 객체에서 각각의 값을 꺼내서 append 해야 함
  formData.append("category_id", product.category_id);
  formData.append("name", product.name);
  formData.append("description", product.description);
  formData.append("price", product.price);
  formData.append("stock", product.stock);

  // 파일 추가
  selectedFiles.forEach((file) => {
    formData.append("images", file);
  });
  console.log("실제 파일 객체 확인:", selectedFiles);
  try {
  // headers 속성을 아예 빼고 보내보세요!
  const res = await axios.post("http://localhost:3000/api/products", formData);
  
  if (res.data.success) {
    alert("商品が登録されました。");
    navigate("/");
  }
    } catch (err) {
      console.error("エラーコード:", err.response?.data);
    }   
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          新規商品登録
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
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

          {/* ファイルアップロード入力 */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              商品画像 (最初の写真がメイン画像になります)
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              ファイル選択 (最大5枚まで、各250KB制限)
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            
            {/* 선택된 파일 목록 표시 */}
            <Box sx={{ mt: 1 }}>
              {selectedFiles.map((file, index) => (
                <Typography key={index} variant="caption" display="block">
                  {index + 1}. {file.name}
                </Typography>
              ))}
            </Box>
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