import { useState, useEffect } from "react";
import { fetchJapaneseAddress } from "../utils/address";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";


export const useProfile = () => {
    const { user ,verifyPassword: checkPasswordApi } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [confirmInput, setConfirmInput] = useState("");
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
        const success = await checkPasswordApi(confirmInput);

        if (success) {
            setIsVerified(true);
            setIsEditing(true);
            setConfirmInput("");
            setError("");
        } else {
            alert("パスワードが正しくありません。"); 
            setIsVerified(false);
            return;
        }
    };

    const cancelEdit = () => {
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
        //パスワードが一致することを確認
        if (formData.password && formData.password !== formData.confirmPassword) {
          setError("パスワードが一致しません。");
          return;
        }
    
        const zipRegex = /^\d{7}$/; //郵便番号7文字
        if (formData.zip_code && !zipRegex.test(formData.zip_code)) {
          setError("郵便番号は7桁の数字で入力してください。");
          return;
        }
        const pureZip = String(formData.zip_code).replace(/\D/g, ""); //ブランク、 - などすべて削除
        console.log("전송 데이터 확인:", { ...formData, zip_code: pureZip });
        try {
        const response = await api.put("/users/update-profile", {
            ...formData,
            zip_code: pureZip
        });

        if (response.data.success || response.status === 200) {
            setSuccess(true);
            setIsEditing(false);
            setIsVerified(false);
            
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