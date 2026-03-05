import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isAuthenticated } from "../../utils/auth";
import { LoadingView } from "../LoadingCircle";

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'authorized'

    useEffect(() => {
        setStatus("loading");
        if (!isAuthenticated() || !user) { //토큰 및 유저확인
            alert("ログインが必要です。");
            logout();
            navigate("/login");
            return;
        }
        setStatus("authorized");
    }, [user, navigate, logout]);

    if (status === "loading" || status === "idle") { //로딩 UI
        return ( <LoadingView /> ); 
    }
    return status === "authorized" ? children : null; //확인 끝나면 페이지 노출
};

export default AuthGuard;