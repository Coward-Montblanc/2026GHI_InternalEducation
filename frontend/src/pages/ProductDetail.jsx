import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // API 호출을 위해 필요
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import Footer from "../components/Footer";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(""); // 현재 크게 보여줄 이미지
  const url = import.meta.env.VITE_API_URL; //.env파일에서 가져온 url

  useEffect(() => {
    // 상품 상세 정보 가져오기 (이미지 배열이 포함되어 있어야 함)
    fetch(`${url}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // 첫 번째 이미지를 메인으로 설정 (보통 DB 조회 시 main_image가 먼저 오도록 쿼리)
        if (data.images && data.images.length > 0) {
          setMainImage(`${url}${data.images[0].image_url}`);
        }
      })
      .catch((err) => {
        setError(err.message); //에러 검출
        console.error("Error code : ",err);
      });
  }, [id, url]);

  const handleAddToCart = async () => { //장바구니 담기
    const storedUser = JSON.parse(localStorage.getItem("user"));     // 로컬스토리지에서 로그인된 유저 정보 가져오기
    
    if (!storedUser || !storedUser.login_id) {
      alert("ログインが必要なサービスです。");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/cart/addcart`, {
        login_id: storedUser.login_id,
        product_id: id,      // 상품 ID
        quantity: quantity,  // 현재 선택된 수량
      });

      if (response.data.success) {
        if (window.confirm("カートに入れました。ショッピングカートのページに移動しますか？")) {
          navigate("/cart"); // 장바구니 페이지 경로
        }
      }
    } catch (err) {
      console.error("Cart error:", err);
      alert(err.response?.data?.message || "カートに入れることができませんでした。");
    }
  };

  const formatPrice = (price) => {
    return price?.toLocaleString();
  };

  const changeQuantity = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  if (error) {
    return (
      <Box>
        <Box sx={{ p: 5, textAlign: "center" }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>メインに戻る</Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!product) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ p: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ display: "flex", gap: "40px", mb: 8, flexDirection: { xs: "column", md: "row" } }}>
          
          {/* 좌측: 이미지 영역 */}
          <Box sx={{ flex: "1" }}>
            {/* 큰 이미지 표시부 */}
            <Box sx={{
              width: "100%",
              height: "500px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {mainImage ? (
                <img src={mainImage} alt="상품 이미지" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <Typography color="text.secondary">画像がありません。</Typography>
              )}
            </Box>

            {/* 서브 이미지 리스트 (썸네일) */}
            <Box sx={{ display: "flex", gap: "10px", mt: 2, flexWrap: "wrap" }}>
              {product.images?.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setMainImage(`${url}${img.image_url}`)}
                  sx={{
                    width: "80px",
                    height: "80px",
                    border: mainImage === `${url}${img.image_url}` ? "2px solid #1976d2" : "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    overflow: "hidden"
                  }}
                >
                  <img src={`${url}${img.image_url}`} alt="サムネイル" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* 우측: 상품 정보 구매 섹션 */}
          <Box sx={{ flex: "1" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>{product.name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>カテゴリー: {product.category_name || "가전"}</Typography>
            
            <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }} />

            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold", mb: 4 }}>
              {formatPrice(product.price)}円
            </Typography>

            <Typography sx={{ mb: 1 }}>在庫: <strong>{product.stock}</strong>個</Typography>
            <Typography color="success.main" sx={{ mb: 4 }}>配送料: 無料</Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
              <Typography>수량:</Typography>
              <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px" }}>
                <Button onClick={() => changeQuantity(-1)} disabled={quantity <= 1}>-</Button>
                <Typography sx={{ width: "40px", textAlign: "center" }}>{quantity}</Typography>
                <Button onClick={() => changeQuantity(1)} disabled={quantity >= product.stock}>+</Button>
              </Box>
            </Box>

            <Box sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: "8px", mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">合計金額</Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: "bold" }}>
                  {formatPrice(product.price * quantity)}円
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}> {/*장바구니 버튼 업데이트. 재고0일경우 구입버튼, 장바구니 버튼 다 비활성 기능 필요*/}
              <Button variant="outlined" fullWidth size="large" onClick={handleAddToCart} disabled={product.stock === 0}> カート</Button>
              <Button variant="contained" fullWidth size="large" color="primary">購入</Button>
            </Stack>

            {product.stock === 0 && <Alert severity="warning" sx={{ mt: 2 }}>現在品切れ中です。</Alert>}
          </Box>
        </Box>

        {/* 하단: 상품 상세 설명 */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, borderBottom: "2px solid #333", pb: 1 }}>商品詳細</Typography>
          <Box sx={{ p: 4, border: "1px solid #eee", borderRadius: "8px" }}>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {product.description || "商品詳細説明がありません。"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default ProductDetail;