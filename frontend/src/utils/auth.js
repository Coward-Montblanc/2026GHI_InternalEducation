import storage from "./storage";

export const isAuthenticated = () => { 
    const token = storage.get("token"); 
    return !!token; 
};

export const handleAuthError = (navigate, logout) => {
    alert("ログインが必要です。");
    logout();
    navigate("/login");
};

