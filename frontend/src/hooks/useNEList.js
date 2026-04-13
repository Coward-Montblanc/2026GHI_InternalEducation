import { useState, useEffect, useCallback } from "react";

export function useNEList(fetchFn, listKey, errorMessage) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFn();
      const next = data?.[listKey];
      setItems(Array.isArray(next) ? next : []);
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
