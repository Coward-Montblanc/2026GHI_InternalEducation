import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { getFallbackImageUrl } from "../services/ProductService";

function OrderList({ items, url, showImage = true }) {
  const displayItems = Array.isArray(items) ? items : [];
  const fallbackImage = getFallbackImageUrl(url);
  return (
    <Paper sx={{ p: 3 }} elevation={4}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>購入商品一覧</Typography>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ background: '#f5f5f5' }}>
            {showImage && <TableCell align="center">商品写真</TableCell>}
            <TableCell align="center">商品名</TableCell>
            <TableCell align="center">数量</TableCell>
            <TableCell align="center">価格</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayItems.map((item) => (
            <TableRow key={item.cart_item_id ?? item.product_id ?? item.order_item_id}>
              {showImage && (
                <TableCell align="center">
                  <img
                    src={item.image_url ? `${url}${item.image_url}` : fallbackImage}
                    alt={item.name || item.product_name}
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                  />
                </TableCell>
              )}
              <TableCell>{item.name || item.product_name || `商品ID ${item.product_id}`}</TableCell>
              <TableCell align="center">{item.quantity}</TableCell>
              <TableCell align="right">{(item.price * item.quantity).toLocaleString()}円</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ textAlign: 'right', mt: 2 }}>
        <Typography variant="h5">総支払金額</Typography>
        <Typography variant="h4"><b>{displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()}円</b></Typography>
      </Box>
    </Paper>
  );
}

export default OrderList;