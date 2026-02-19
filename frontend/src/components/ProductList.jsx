import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid, Card,
  CardContent,
  Typography,
  Button, Box,
  Alert,Pagination,
} from "@mui/material";
import { singleProductToItems, goToBuyPage } from '../services/OrderService.js';
import { getProducts, getProductsByCategory, getPopularProducts } from "../services/ProductService";
import { addToCart } from "../services/CartService";
function ProductList({ categoryId, searchText }) { // 검색어(searchText) prop 추가
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL; //.env파일에서 가져옴
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 24; // 6개 x 4줄

  useEffect(() => { //페이지 1로 초기화
    setPage(1);
  }, [categoryId, searchText]);

  useEffect(() => { //카테고리 변경시 새상품 불러오기
    fetchProducts();
  }, [page, categoryId, searchText]);

  const handlePageChange = (event, value) => {
  setPage(value);
};

  const fetchProducts = async () => {
  try {
    setLoading(true);
    let data;
    if (searchText === "人気商品") {
      data = await getPopularProducts();
      setProducts(data);
      setTotalPages(1);
    } else if (categoryId) {
      data = await getProductsByCategory(categoryId, searchText);
      setProducts(data);
      setTotalPages(1);
    } else {
      data = await getProducts(page, itemsPerPage, searchText);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };


  let filteredProducts = products;

  // 로그인 상태 확인
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Box sx={{ p: 4, maxWidth: "1400px", margin: "0 auto", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!error && filteredProducts.length === 0 && (
        <Alert severity="info">商品がありません。</Alert>
      )}

      {!error && filteredProducts.length > 0 && (
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
                      src={`${url}${product.main_image}`}
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
                    onClick={async () => {
                    try {
                      const user = JSON.parse(localStorage.getItem("user"));
                      const data = await addToCart(user.login_id, product.product_id, 1);
                      if (data.success) {
                        if (window.confirm(`「${product.name}」${1}個がカートに追加されました。カートに移動しますか？`)) {
                          navigate("/cart");
                        }
                      } else {
                        alert(data.message || "カート追加に失敗しました");
                      }
                    } catch (err) {
                      alert("カート追加中にエラーが発生しました");
                    }
                  }}
                  disabled={product.stock === 0}
                  >
                    カート
                  </Button>
                  <Button 
                    variant="contained"
                    fullWidth
                    size="large"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        alert("ログイン後に実行してください");
                        return;
                      }
                      alert(`「${product.name}」1個を購入します。購入ページへ移動します。`);
                      const items = singleProductToItems(product, 1); //메인리스트에서는 상품 1개만 불러옵니다.
                      goToBuyPage(navigate, items);
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