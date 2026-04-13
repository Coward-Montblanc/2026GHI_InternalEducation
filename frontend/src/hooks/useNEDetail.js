import { useState, useEffect, useCallback } from "react";

export function useNEDetail(id, getDetailFn, deleteFn, options = {}) {
  const {
    listPath = "/notice",
    itemKey = "notice",
    notFoundMessage = "見つかりません。",
    confirmMessage = "削除しますか？",
  } = options;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getDetailFn(id);
      setItem(data?.[itemKey] ?? data);
    } catch (err) {
      setError(err.response?.data?.message || notFoundMessage);
    } finally {
      setLoading(false);
    }
  }, [id, getDetailFn, itemKey, notFoundMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = useCallback(
    async (navigate) => {
      if (!window.confirm(confirmMessage)) return;
      try {
        await deleteFn(id);
        navigate(listPath);
      } catch (err) {
        alert(err.response?.data?.message || "削除に失敗しました。");
      }
    },
    [id, deleteFn, listPath, confirmMessage]
  );

  return { item, loading, error, handleDelete };
}
