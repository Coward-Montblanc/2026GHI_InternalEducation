import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Stack, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayIcon from "@mui/icons-material/Replay";
import { useCart } from "../hooks/useCart";
import { BuyPageMany } from "../services/OrderService";
import { getFallbackImageUrl } from "../services/ProductService";
import { LoadingView } from "../components/LoadingCircle";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, url, loading, totalPrice, handleUpdateQty, handleToggleStatus } = useCart();
  const fallbackImage = getFallbackImageUrl(url);

  if (loading) { return <LoadingView />; }

  return (
    <Box sx={{ p: 5, maxWidth: "1000px", margin: "0 auto" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>カート</Typography>
      {cartItems.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 10 }}>カートは空です。</Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                <TableRow>
                  <TableCell>商品</TableCell>
                  <TableCell align="center">数量</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell align="center">削除</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.cart_item_id}
                    sx={{
                          bgcolor: item.status === 1 ? "#f9f9f9" : "inherit",
                          opacity: item.status === 1 ? 0.6 : 1
                        }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <img
                          src={item.image_url ? `${url}${item.image_url}` : fallbackImage}
                          alt={item.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                        />
                        {item.product_id ? (
                          <Link to={`/product/${item.product_id}`} style={{ color: "inherit", textDecoration: "none" }}>
                            <Typography variant="body1" sx={{ "&:hover": { textDecoration: "underline" } }}>{item.name}</Typography>
                          </Link>
                        ) : (
                          <Typography variant="body1">{item.name}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1, item.stock)} disabled={item.quantity <= 1}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField size = "small"
                                   value={item.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                    handleUpdateQty(item.cart_item_id, val);
                                    } }} 
                                onBlur={(e) => {handleUpdateQty(item.cart_item_id, e.target.value, item.stock); }} 
                                inputProps={{ style: { textAlign: 'center', width: '40px', padding: '5px' }, type: 'number' }}
                                sx={{ "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0, } }} 
                                disabled={item.status === 1} />
                        <IconButton size="small" onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1, item.stock)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {(item.price * item.quantity).toLocaleString()}円
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color={item.status === 1 ? "primary" : "error"}
                                  onClick={() => handleToggleStatus(item.cart_item_id, item.status)}>
                                    {item.status === 1 ? <ReplayIcon /> : <DeleteIcon />}
                                  </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: "8px", textAlign: "right" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>合計金額</Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: "bold", mb: 3 }}>
              {totalPrice.toLocaleString()}円
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ px: 10 }}
              onClick={() => BuyPageMany(navigate, cartItems)}
              disabled={cartItems.length === 0 || totalPrice === 0}
            >
              注文
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}


export default CartPage;