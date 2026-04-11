import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isAuthenticated } from "../../utils/auth";
import { LoadingView } from "../LoadingCircle";

const AuthGuard = ({ requireAdmin = false }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'authorized'

    useEffect(() => {
        setStatus("loading");
        if (!isAuthenticated() || !user) { //トークンとユーザー確認
            if (isAuthenticated()) {
                alert("ログインが必要です。");
                logout();
            }
            navigate("/login");
            return;
        }
        if (requireAdmin && user.role !== "ADMIN") {
            alert("管理者のみアクセスできます。");
            navigate("/");
            return;
        }
        setStatus("authorized");
    }, [user, navigate, logout, requireAdmin]);

    if (status === "loading" || status === "idle") { //ロードUI
        return ( <LoadingView /> ); 
    }
    return status === "authorized" ? <Outlet /> : null; //確認が終わったらページを公開
};

export default AuthGuard;