import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersByUser } from "../services/OrderService";


export const useOrder = () =>{
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchOrders = useCallback(async () => {
    // AuthGuard가 이미 걸러주지만 데이터 호출 전 안전장치
    if (!user?.login_id) return;

    try {
      setLoading(true);
      const data = await getOrdersByUser(user.login_id);
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error("注文 로딩 에러:", err);
      setError(err.response?.data?.message || "注文一覧の取得に失敗しました。");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.login_id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  
  return {
  user,
  loading, 
  orders,
  error,
  fetchOrders
  };

}

