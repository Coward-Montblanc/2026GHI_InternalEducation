import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function ProductList({ categoryId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 24;

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = categoryId 
        ? `http://localhost:3000/api/products/category/${categoryId}`
        : `http://localhost:3000/api/products?page=${page}&limit=${itemsPerPage}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("商品読み込み失敗");
      
      const data = await response.json();
      
      if (categoryId) {
        // 카테고리별 조회는 배열로 반환됨
        setProducts(data);
        setTotalPages(1);
      } else {
        // 전체 조회는 페이지네이션 포함
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // メイン商品リスト表示
  return (
    <Box sx={{ p: 4, maxWidth: "1100px", margin: "0 auto" }}>
      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 商品なしメッセージ */}
      {!error && products.length === 0 && (
        <Alert severity="info">
          商品がありません。
        </Alert>
      )}

      {/* グリッドレイアウトコンテナ */}
      {!error && products.length > 0 && (
        <Grid container spacing={2} columns={8} justifyContent="center">
        {products.map((product) => (
          <Grid 
            item 
            xs={1}
            key={product.product_id}
            sx={{ minWidth: '140px', maxWidth: '160px' }}
          >
            {/* 商品カード */}
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                transition: "all 0.2s",
              }}
              onClick={() => navigate(`/product/${product.product_id}`)} // 商品詳細ページへ移動
            >
              {/* 商品画像エリア */}
              <Box
                sx={{
                  paddingTop: "75%", // 4:3比率
                  backgroundColor: "#f5f5f5",
                  backgroundImage: product.main_image ? `url(${product.main_image})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {/* 画像がない場合のプレースホルダー */}
                {!product.main_image && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    写真なし
                  </Typography>
                )}
              </Box>

              {/* 商品情報エリア */}
              <CardContent sx={{ pb: 1 }}>
                {/* 商品名 */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  }}
                >
                  {product.name}
                </Typography>
                {/* 商品価格 */}
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatPrice(product.price)}円
                </Typography>
              </CardContent>

              {/* ボタンエリア */}
              <Box sx={{ display: "flex", gap: 1, px: 2, pb: 2 }}> {/* flex-나란히, gap-간격, px-좌우 여백, pb-아래 여백 */}
                {/* カートに追加ボタン */}
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={(e) => {
                    e.stopPropagation(); // 카트 클릭 후의 펑션
                    alert(`${product.name}をカートに追加しました。`);
                  }}
                  disabled={product.stock === 0} // 재고x
                  sx={{ flex: 1, whiteSpace: "nowrap" }}
                >
                  カート
                </Button>
                {/* 購入ボタン */}
                <Button
                  variant="contained"
                  size="medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 나중에 장바구니 페이지로 이동 예정
                  }}
                  disabled={product.stock === 0} //재고 x
                  sx={{ flex: 1, whiteSpace: "nowrap" }}
                >
                  購入
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {/* ページネーション */}
      {!error && totalPages > 1 && ( //2페이지 이상일 때 표시되는 페이지네이션
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} //백엔드에서 받는 총 페이지 수
            page={page} //현재 페이지
            onChange={handlePageChange} //페이지 변경
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}

export default ProductList;