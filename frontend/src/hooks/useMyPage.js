//現在のログイン機能はAuthContextファイルにあり、現在このファイルは役に立ちません。
//マイページ内に固有の機能が追加された場合に備えておく。

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../utils/storage";

export const useMyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = storage.get("token");
        if (!token || !user) {
            alert("ログインが必要です。");
            navigate("/login");
            return;
        }
        try {
            setLoading(false);
        } catch (error) {
            console.error("Token error:", error);
            logout();
            navigate("/login");
        }
    }, [user, navigate, logout]);

    

    return { user, loading };
};