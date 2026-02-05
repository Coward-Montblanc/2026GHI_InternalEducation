import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // 商品情報を読み込む
  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
      })
      .catch(err => {
        setError("商品を読み込めません。");
      });
  }, [id]);

  // 価格表示形式
  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  // 数量変更
  const changeQuantity = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  // エラー
  if (error) {
    return (
      <Box>
        <Header />
        <Box style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
            メインに戻る
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!product) return null; //상품 없음 에러 방지

  return (
    <Box>
      <Header />
      
      {/* メインコンテンツ */}
      <Box style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* 商品情報エリア */}
        <Box style={{ display: "flex", gap: "40px", marginBottom: "60px", flexWrap: "wrap" }}>
          
          {/* 左側：画像ボックス */}
          <Box style={{ flex: "1", minWidth: "400px" }}>
            <Box style={{
              width: "100%",
              height: "500px",
              backgroundColor: "#e8e8e8",
              border: "2px solid #ccc",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column"
            }}>

              <Typography variant="h6" style={{ color: "#666", marginTop: "10px" }}>
                商品画像
              </Typography>
            </Box>
          </Box>

          {/* 右側：商品情報 */}
          <Box style={{ flex: "1", minWidth: "400px" }}>
            
            {/* 商品名 */}
            <Typography variant="h4" style={{ fontWeight: "bold", marginBottom: "20px" }}>
              {product.name}
            </Typography>

            <hr style={{ border: "1px solid #eee", margin: "20px 0" }} />

            {/* 価格 */}
            <Typography variant="h5" style={{ color: "#1976d2", fontWeight: "bold", marginBottom: "20px" }}>
              {formatPrice(product.price)}円
            </Typography>

            {/* 在庫 */}
            <Typography style={{ marginBottom: "10px", color: "#666" }}>
              在庫: {product.stock}個
            </Typography>

            {/* 配送料 */}
            <Typography style={{ marginBottom: "30px", color: "#666" }}>
              配送料: 無料
            </Typography>

            <hr style={{ border: "1px solid #eee", margin: "20px 0" }} />

            {/* 数量選択 */}
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
              <Button 
                variant="outlined" 
                onClick={() => changeQuantity(-1)}
                disabled={quantity <= 1}
                style={{ minWidth: "40px", height: "40px" }}
              >
                -
              </Button>
              <TextField
                value={quantity}
                style={{ width: "80px" }}
                inputProps={{ style: { textAlign: "center" } }}
                size="small"
              />
              <Button 
                variant="outlined" 
                onClick={() => changeQuantity(1)}
                disabled={quantity >= product.stock}
                style={{ minWidth: "40px", height: "40px" }}
              >
                +
              </Button>
            </Box>

            {/* 合計金額 */}
            <Box style={{ 
              padding: "20px", 
              backgroundColor: "#f9f9f9", 
              borderRadius: "8px",
              marginBottom: "30px" 
            }}>
              <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                  合計金額
                </Typography>
                <Typography variant="h5" style={{ color: "#1976d2", fontWeight: "bold" }}>
                  {formatPrice(product.price * quantity)}円
                </Typography>
              </Box>
            </Box>

            {/* ボタン */}
            <Box style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => alert(`${product.name} ${quantity}個をカートに追加しました。`)}
                disabled={product.stock === 0}
                style={{ height: "56px", fontSize: "16px" }}
              >
              カート
              </Button>
              <Button
                variant="contained"
                fullWidth
                //購入ページが作成されたら移動するように
                disabled={product.stock === 0}
                style={{ height: "56px", fontSize: "16px" }}
              >
                購入
              </Button>
            </Box>

            {product.stock === 0 && (
              <Alert severity="warning" style={{ marginTop: "20px" }}>
                現在品切れ中です。
              </Alert>
            )}
          </Box>
        </Box>

        {/* 商品詳細説明 */}
        <Box>
          <Typography variant="h5" style={{ fontWeight: "bold", marginBottom: "20px" }}>
            商品詳細
          </Typography>
          <Box style={{ 
            padding: "30px", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            backgroundColor: "white" 
          }}>
            <Typography style={{ lineHeight: "2", whiteSpace: "pre-wrap" }}>
              {product.description || "商品詳細説明がありません。"}
            </Typography>
          </Box>
        </Box>

        {/* リストに戻るボタン */}
        <Box style={{ textAlign: "center", marginTop: "40px" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            style={{ minWidth: "200px" }}
          >
            ← 商品リストへ
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default ProductDetail;
