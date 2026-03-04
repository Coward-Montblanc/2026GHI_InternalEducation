import { useState, useEffect, useCallback } from "react";

export function useNEList(fetchFn, listKey, errorMessage) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => { //데이터 바꿔끼우기
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFn();
      setItems(data[listKey] ?? data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || errorMessage);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, listKey, errorMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, error, refetch: fetch };
}
