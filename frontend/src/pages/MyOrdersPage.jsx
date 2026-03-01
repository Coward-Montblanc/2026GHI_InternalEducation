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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersByUser } from "../services/OrderService";
import { getOrderStatusLabel } from "../services/OrderService";

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.login_id) {
      setLoading(false);
      setError("ログインが必要です。");
      return;
    }
    const fetchOrders = async () => {
      try {
        const data = await getOrdersByUser(user.login_id);
        setOrders(data.orders || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "注文一覧の取得に失敗しました。");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.login_id]);

  if (!user) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, margin: "0 auto" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          ログイン後にご利用ください。
        </Alert>
        <Button variant="contained" onClick={() => navigate("/login")}>
          ログイン
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatPrice = (price) => new Intl.NumberFormat("ja-JP").format(price);
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

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

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/")}>
          ホームへ戻る
        </Button>
      </Box>
    </Box>
  );
}
