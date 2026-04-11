import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getOrder, getOrderStatusLabel } from "../services/OrderService";
import OrderList from "../components/OrderList";
import { LoadingView } from "../components/LoadingCircle";

export default function OrderConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const order_id = location.state?.order_id;

  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!order_id);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!order_id) {
      
      setError("注文情報がありません。");
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const data = await getOrder(order_id);

        
        if (data.success ) {
          setOrderInfo(data.order); 
          setItems(data.items || []);
        } else {
          setError("注文の取得に失敗しました。");
        }
      } catch (err) {
        
        setError(err.response?.data?.message || "注文の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [order_id]);

  if (loading) { return ( <LoadingView /> ); }

  if (error || !order_id) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, margin: "0 auto" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "注文情報がありません。"}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          ホームへ戻る
        </Button>
      </Box>
    );
  }

  if (!orderInfo) return <LoadingView />;

  const url = import.meta.env.VITE_API_URL || "";
  const listItems = items.map((row) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    name: row.product_name,
    quantity: row.quantity,
    price: row.price,
    image_url: row.image_url || "",
  }));

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "green" }} />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: "bold" }}>
            注文が完了しました
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            注文番号: {orderInfo.order_id}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            状態: {getOrderStatusLabel(orderInfo.status)}
          </Typography>
        </Box>

        <OrderList items={listItems} url={url} showImage={false} linkToProduct />

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          配送先
        </Typography>
        <Typography variant="body2">
          受け取り人：{orderInfo.receiver_name} 
        </Typography>
        <Typography variant="body2">
          連絡先：{orderInfo.phone}
        </Typography>
        <Typography variant="body2">
          住所： {orderInfo.address}
          {orderInfo.address_detail ? ` ${orderInfo.address_detail}` : ""}
        </Typography>
        {orderInfo.delivery_request && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            配達リクエスト: {orderInfo.delivery_request}
          </Typography>
        )}

        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="contained" onClick={() => navigate("/")}>
            ホームへ戻る
          </Button>
          <Button variant="outlined" onClick={() => navigate("/cart")}>
            カートを見る
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
