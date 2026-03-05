import { useState, useEffect } from "react";
import { getOrder } from "../services/OrderService";

export const useOrderConfirm = (order_id) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!order_id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order_id) {
      setError("注文情報がありません。");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrder(order_id);
        if (data.success && data.order) {
          setOrder(data.order);
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

  return { 
    order, loading, 
    error
   };
};