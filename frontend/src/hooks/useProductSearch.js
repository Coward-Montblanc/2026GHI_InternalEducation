import { useState, useCallback } from 'react';
import api from '../api/axios'; // 설정하신 axios 인스턴스

export const useProductSearch = (initialParams = {}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    const fetchProducts = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await api.get("/products/search", {
                params: {
                    category: params.category_id || undefined,
                    name: params.name || undefined
                }
            });
            if (res.data && res.data.products) {
                // { products: [], pagination: {} } 형태인 경우
                setProducts(res.data.products);
                setPagination(res.data.pagination);
            } else {
                // [ {}, {} ] 배열 형태인 경우
                setProducts(Array.isArray(res.data) ? res.data : []);
                setPagination(null);
            }
            setError(null);
        } catch (err) {
            console.error("검색 실패:", err);
            setError(err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { products, loading, error, fetchProducts, pagination };
};