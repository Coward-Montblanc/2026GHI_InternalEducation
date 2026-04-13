import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from "@mui/material";
import { getOrderStatusLabel } from "../services/OrderService";
import { useOrder } from "../hooks/useOrder";
import { formatDate } from "../utils/date";
import { LoadingView } from "../components/LoadingCircle";

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { loading, orders, error } = useOrder();

  if (loading) { return ( <LoadingView /> ); }

  const formatPrice = (price) => new Intl.NumberFormat("ja-JP").format(price);

  return (
    <Box sx={{ p: 4, maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        注文履歴
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">注文履歴はありません。</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/")}>
              商品を見る
            </Button>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell align="center">注文番号</TableCell>
                <TableCell align="center">日付</TableCell>
                <TableCell align="center">合計金額</TableCell>
                <TableCell align="center">状態</TableCell>
                <TableCell align="center">詳細</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((row) => (
                <TableRow key={row.order_id} hover>
                  <TableCell align="center">{row.order_id}</TableCell>
                  <TableCell align="center">{formatDate(row.created_at)}</TableCell>
                  <TableCell align="center">{formatPrice(row.total_price)}円</TableCell>
                  <TableCell align="center">{getOrderStatusLabel(row.status)}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => navigate(`/order-confirm`, { state: { order_id: row.order_id } })}>
                      注文商品
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
