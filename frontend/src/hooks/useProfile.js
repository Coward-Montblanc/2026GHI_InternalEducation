import { useState, useEffect } from "react";
import { fetchJapaneseAddress } from "../utils/address";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";


export const useProfile = () => {
    const { user ,verifyPassword: checkPasswordApi } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isVerified, setIsVerified] = useState(false); //본인 확인용
    const [confirmInput, setConfirmInput] = useState(""); // 확인용 비번 입력값
    const [formData, setFormData] = useState({
            password: "",
            confirmPassword: "",
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            zip_code: user?.zip_code || "",
            address: user?.address || "",
            address_detail: user?.address_detail || "",
            role: user?.role || "USER"
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                zip_code: user.zip_code || "",
                address: user.address || "",
                address_detail: user.address_detail || "",
                    }));
                }
    }, [user]);

    const handleVerify = async () => {
        const success = await checkPasswordApi(confirmInput); //받은 비밀번호 검증

        if (success) { //연결 성공시
            setIsVerified(true);
            setIsEditing(true);
            setConfirmInput(""); // 입력값 초기화
            setError("");
        } else {
            alert("パスワードが正しくありません。"); 
            setIsVerified(false);
            return;
        }
    };

    const cancelEdit = () => {// 데이터 초기화
    setIsEditing(false);
    setIsVerified(false);
    setConfirmInput("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    const Address = async (zip) => {
    try {
      if (!zip) {
        alert("郵便番号を入力してください。");
        return;
      }
      const result = await fetchJapaneseAddress(zip); 
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          address: result.address,
          zip_code: result.zip_code || zip 
        }));
      } else {
        alert("該当する住所が見つかりませんでした。");
      }
    } catch (error) {
      console.error("Address fetch error:", error);
    }
    };

    const handleSave = async () => {
        setError("");
        if (formData.password && formData.password !== formData.confirmPassword) {//비밀번호 일치하는지 확인
          setError("パスワードが一致しません。"); //alert로 나타낼지 고민중.
          return;
        }
    
        const zipRegex = /^\d{7}$/; //우편번호 7글자
        if (formData.zip_code && !zipRegex.test(formData.zip_code)) {
          setError("郵便番号は7桁の数字で入力してください。"); //alert로 나타낼지 고민중.
          return;
        }
        const pureZip = String(formData.zip_code).replace(/\D/g, ""); //공백, - 등 전부 제거
        console.log("전송 데이터 확인:", { ...formData, zip_code: pureZip });
        try {
        const response = await api.put("/users/update-profile", {
            ...formData,
            zip_code: pureZip // 서버에는 숫자만 보냄
        });

        if (response.data.success || response.status === 200) {
            setSuccess(true);
            setIsEditing(false);
            setIsVerified(false); // 수정 완료 후 다시 본인인증 모드로
            
            // 비밀번호 필드만 초기화
            setFormData(prev => ({ 
                ...prev, 
                password: "", 
                confirmPassword: "" 
            }));

            console.log("変更成功しました。:", response.data);
            setTimeout(() => setSuccess(false), 3000);
        }
        } catch (err) {
            console.error("エラーが発生しました。:", err);
            setError(err.response?.data?.message || "情報の更新に失敗しました。");
        }
    };
    
    
    
    return{
        isEditing,
        isVerified,      
        confirmInput,  
        setConfirmInput,
        formData,
        error,
        success,
        handleChange,
        handleSave,
        setIsEditing,
        handleVerify,    
        Address,
        cancelEdit
    }
}