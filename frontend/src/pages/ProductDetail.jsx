import { Box, Typography, Button, Alert, Stack } from "@mui/material";
import Footer from "../components/Footer";
import { useProductDetail } from "../hooks/useProductDetail.js";
import { LoadingView } from "../components/LoadingCircle";

function ProductDetail() {
  const{
        product, quantity,navigate,
        mainImage, setMainImage,
        url, error,
        fallbackImage,
        formatPrice,
        changeQuantity,
        AddToCart,
        BuyNow
  } = useProductDetail();

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

  if (!product) { return ( <LoadingView /> ); }

  return (
    <Box>
      <Box sx={{ p: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ display: "flex", gap: "40px", mb: 8, flexDirection: { xs: "column", md: "row" } }}>
          
          {/* 좌측: 이미지 영역 */}
          <Box sx={{ flex: "1" }}>
            {/* 큰 이미지 표시부분 */}
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
              <img
                src={mainImage || fallbackImage}
                alt="商品画像"
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>

            {/* 메인이미지 서브이미지　Role: 1,2 */}
            <Box sx={{ display: "flex", gap: "10px", mt: 2, flexWrap: "wrap" }}>
              {/* 메인이미지와 서브이미지를 결정하는 부분 */}
              {(product.images?.filter((img) => img.role === 1 || img.role === 2) || []).map((img, index) => (
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
                  <img
                    src={`${url}${img.image_url}`}
                    alt="サムネイル"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* 우측: 상품 정보 구매 섹션 */}
          <Box sx={{ flex: "1" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>{product.name}</Typography>
              {/* 조회수 표시 */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                View: {product.view ?? 0}회 {/* 프론트/백 동시에 켜져있으니 조회수 증가가 +2로 되고있는 것 같습니다. 확인필요 */}
              </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>カテゴリー: {product.category_name || "가전"}</Typography>
            
            <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }} />

            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold", mb: 4 }}>
              {formatPrice(product.price)}円
            </Typography>

            <Typography sx={{ mb: 1 }}>在庫: <strong>{product.stock}</strong>個</Typography>
            <Typography color="success.main" sx={{ mb: 4 }}>配送料: 無料</Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
              <Typography>数量:</Typography>
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

            <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large" 
                  onClick={AddToCart} //
                  disabled={product.stock === 0}
                >
                  カート
                </Button>
              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                color="primary"
                onClick={BuyNow}
                disabled={product.stock === 0}
              >
                購入
              </Button>
            </Stack>

            {product.stock === 0 && <Alert severity="warning" sx={{ mt: 2 }}>現在品切れ中です。</Alert>}
          </Box>
        </Box>

        {/* 하단: 상품 상세 설명 + 상세 이미지 */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, borderBottom: "2px solid #333", pb: 1 }}>商品詳細</Typography>
          <Box sx={{ p: 4, border: "1px solid #eee", borderRadius: "8px" }}>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {product.description || "商品詳細説明がありません。"}
            </Typography>
            {/* 상세이미지 / role: 3） */}
            {(product.images?.filter((img) => img.role === 3).length > 0) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>詳細画像</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {product.images
                    .filter((img) => img.role === 3)
                    .map((img, index) => (
                      <Box key={img.image_id ?? index} sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
                        <img
                          src={`${url}${img.image_url}`}
                          alt={`詳細 ${index + 1}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                          style={{ width: "100%", height: "auto", display: "block", borderRadius: "8px" }}
                        />
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default ProductDetail;