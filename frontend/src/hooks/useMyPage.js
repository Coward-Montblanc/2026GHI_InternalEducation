//현재 로그인 기능은 AuthContext 파일에 다 있어서 현재 이 파일이 쓸모가 없음.
//마이페이지 내 고유 기능이 추가될 경우를 대비해서 놔둠.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../utils/storage"; //스토리지 

export const useMyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // AuthContext에서 유저 정보와 로그아웃 함수 가져옴
    const [loading, setLoading] = useState(true);

    useEffect(() => { // 로그인 토큰 관련도 확인후 유틸로 뺄 생각중. 임시로 넣음
        const token = storage.get("token"); //토큰 여부 판별
        if (!token || !user) {
            alert("ログインが必要です。");
            navigate("/login");
            return;
        }
        try {
            setLoading(false); //토큰확인후 실행
        } catch (error) {
            console.error("Token error:", error);
            logout();
            navigate("/login");
        }
    }, [user, navigate, logout]);

    

    return { user, loading };
};