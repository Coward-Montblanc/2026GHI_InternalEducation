import storage from "./storage"; // 스토리지 임포트

export const isAuthenticated = () => { 
    const token = storage.get("token"); // 토큰 존재 체크
    return !!token; 
};

export const handleAuthError = (navigate, logout) => {
    alert("ログインが必要です。");
    logout();
    navigate("/login");
};

