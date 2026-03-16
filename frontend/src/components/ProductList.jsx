import { useNavigate } from "react-router-dom";
import {
  Grid, Card,
  CardContent,
  Typography,
  Button, Box,
  Alert, Pagination,
} from "@mui/material";
import { singleProductToItems} from '../services/OrderService.js';
import { getFallbackImageUrl } from "../services/ProductService";
import { addToCart } from "../services/CartService";
import { LoadingView } from "../components/LoadingCircle";
import { storage } from "../utils/storage";

function ProductList({ products, loading, page, totalPages, onPageChange }) { 
  const navigate = useNavigate();

  const url = import.meta.env.VITE_API_URL;
  const fallbackImage = getFallbackImageUrl(url);
  const isLoggedIn = !!storage.get("token");
  
  const displayProducts = Array.isArray(products) ? products : (products?.products || []);
  const formatPrice = (price) => new Intl.NumberFormat("ko-KR").format(price);

  

  if (loading) return <LoadingView />;

  return (
    <Box sx={{ p: 4, maxWidth: "1400px", margin: "0 auto", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {(!products || products.length === 0) ? (
        <Alert severity="info" sx={{ width: '100%' }}>商品がありません。</Alert>
      ) : (
        <>
          <Grid container spacing={2} justifyContent="center">
            {displayProducts.map((product) => (
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
                    margin: "0 auto"
                  }}
                  onClick={() => navigate(`/product/${product.product_id}`)}
                >
                  <Box sx={{ width: "100%", height: "200px", backgroundColor: "#f5f5f5", position: "relative", overflow: "hidden" }}>
                    <Box
                      component="img"
                      src={product.main_image ? `${url}${product.main_image}` : fallbackImage}
                      alt={product.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                      sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: "3em", fontWeight: 500, mb: 1 }}>
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
                      onClick={async (e) => {
                        e.stopPropagation(); 
                        try {
                          const user = JSON.parse(storage.get("user"));
                          if (!user) return alert("ログイン後に実行してください");
                          const data = await addToCart(user.login_id, product.product_id, 1);
                          if (data.success) {
                            if (window.confirm(`「${product.name}」${1}個がカートに追加されました。カートに移動しますか？`)) navigate("/cart");
                          }
                        } catch (err) { alert("カート追加中にエラーが発生しました"); }
                      }}
                      disabled={product.stock === 0}
                    >
                      カート
                    </Button>
                    <Button 
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) return alert("ログイン後に実行してください");
                        const items = singleProductToItems(product, 1);
                        navigate("/buy", { state: { items } });
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

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={onPageChange} 
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default ProductList;