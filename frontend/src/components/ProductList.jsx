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
// 검색어(searchText) prop 추가
function ProductList({ categoryId, searchText }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 24; // 8개 x 4줄

  useEffect(() => { //페이지 1로 초기화
    setPage(1);
  }, [categoryId, searchText]);

  useEffect(() => { //카테고리 변경시 새상품 불러오기
    fetchProducts();
  }, [page, categoryId, searchText]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = "";
      // 검색어가 있을 때 쿼리 파라미터로 전달
      if (categoryId) {
        url = `http://localhost:3000/api/products/category/${categoryId}`;
        if (searchText) {
          url += `?search=${encodeURIComponent(searchText)}`;
        }
      } else {
        url = `http://localhost:3000/api/products?page=${page}&limit=${itemsPerPage}`;
        if (searchText) {
          url += `&search=${encodeURIComponent(searchText)}`;
        }
      }
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

  // '人気商品' 버튼이 눌렸을 때만 상품명에 '人気商品'이 포함된 상품만 필터링
  let filteredProducts = products;
  if (searchText === "人気商品") {　 //서치텍스트 인기상품
    filteredProducts = products.filter((product) => product.name.includes("人気商品"));
  }

  return (
    <Box sx={{ p: 4, maxWidth: "1400px", margin: "0 auto", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!error && filteredProducts.length === 0 && (
        <Alert severity="info">商品がありません。</Alert>
      )}

      {!error && filteredProducts.length > 0 && ( //상품이 있을 때 그리드로 표시
        <Grid container spacing={2} justifyContent="center">
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={product.product_id}>
              <Card
                sx={{
                  width: "200px",
                  height: "350px",
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
                    height: "200px",
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
                    disabled={product.stock === 0} //재고0일시 비활성화
                  >
                    カート
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`구매 페이지 구현중`);
                    }}
                    disabled={product.stock === 0} //재고0일시 비활성화
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