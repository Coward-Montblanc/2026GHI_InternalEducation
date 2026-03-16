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
        if (!isAuthenticated() || !user) { //토큰 및 유저확인
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

    if (status === "loading" || status === "idle") { //로딩 UI
        return ( <LoadingView /> ); 
    }
    return status === "authorized" ? <Outlet /> : null; //확인 끝나면 페이지 노출
};

export default AuthGuard;