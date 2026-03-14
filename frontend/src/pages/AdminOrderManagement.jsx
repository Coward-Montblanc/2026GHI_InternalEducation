import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";

const SAMPLE_ROWS = [
  { order_id: "OD1", login_id: "yamada01",    product_names: "サンプル商品A", total_quantity: "2",  total_price: "¥25,600", created_at: "2025-01-10" }
];

function AdminOrderManagement() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー注文管理</Typography>
      </Box>
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>注文ID</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>ユーザーID</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>商品名</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>数量</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>合計金額</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>注文日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SAMPLE_ROWS.map((row) => (
                <TableRow key={row.order_id} hover>
                  <TableCell align="center">{row.order_id}</TableCell>
                  <TableCell align="center">{row.login_id}</TableCell>
                  <TableCell>{row.product_names}</TableCell>
                  <TableCell align="center">{row.total_quantity}</TableCell>
                  <TableCell align="center">{row.total_price}</TableCell>
                  <TableCell align="center">{row.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default AdminOrderManagement;
