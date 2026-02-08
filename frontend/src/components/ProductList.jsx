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

function ProductList({ categoryId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 20; // 8컬럼 그리드에 맞춰 조정

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
        setProducts(data);
        setTotalPages(1);
      } else {
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 4, maxWidth: "1400px", margin: "0 auto" }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!error && products.length === 0 && (
        <Alert severity="info">商品がありません。</Alert>
      )}

      {!error && products.length > 0 && (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={product.product_id}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  transition: "all 0.3s",
                }}
                onClick={() => navigate(`/product/${product.product_id}`)}
              >
                {/* 상품 이미지 영역 */}
                <Box
                  sx={{
                    width: "100%",
                    pt: "100%", // 1:1 비율
                    backgroundColor: "#f5f5f5",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {product.main_image ? (
                    <Box
                      component="img"
                      src={`http://localhost:3000${product.main_image}`}
                      alt={product.name}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
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

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      height: "3em",
                      fontWeight: 500,
                      mb: 1
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                    {formatPrice(product.price)}円
                  </Typography>
                </CardContent>

                <Box sx={{ px: 2, pb: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${product.name}をカートに追加しました。`);
                    }}
                    disabled={product.stock === 0}
                  >
                    カート
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.product_id}`);
                    }}
                    disabled={product.stock === 0}
                  >
                    購入
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!error && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}

export default ProductList;