import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../services/OrderService";
import { useAuth } from "../contexts/AuthContext";
import { fetchJapaneseAddress } from "../utils/address"; //주소 찾기 API

export const useBuy = () => {
    const navigate = useNavigate();
    const location = useLocation();
	const { user } = useAuth();
	const [formData, setFormData] = useState({
        receiver_name: "",
        zip_code: "",
        address: "",
        address_detail: "",
        phone: ""
    });

	// BuyService에서 항상 items 배열로 넘기도록 통일
	const { items = [] } = location.state || {};
	
	const url = import.meta.env.VITE_API_URL; //.env파일에서 가져온 url
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [deliveryRequest, setDeliveryRequest] = useState("");
	const [deliveryRequestText, setDeliveryRequestText] = useState("");
	const [open, setOpen] = useState(false);

	
	const handleOrder = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		const { 
        receiver_name, 
        zip_code, 
        address, 
        address_detail, 
        phone 
    	} = formData;

		
		if (!user) {
			setError("ログインが必要です。");
			return;
		}
		if (!receiver_name || !address || !phone || !payment_method) {
			setError("必須情報をすべて入力してください。");
			return;
		}

		const total_price = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

		try {
			const res = await createOrder({
				login_id: user.login_id || user.id || user.username,
				items: items.map(item => ({
					product_id: item.product_id,
					price: item.price,
					quantity: item.quantity
				})),
				total_price,
				receiver_name,
				address,
				address_detail,
				phone,
				delivery_request,
				payment_method
			});
			if (res.success) {
				setSuccess(true);
				setTimeout(() => navigate("/"), 5000); // 5초 뒤에 홈으로 이동
			} else {
				setError("注文に失敗しました。もう一度お試しください。");
			}
		} catch (err) {
			setError(err.response?.data?.message || "注文処理中にエラーが発生しました。");
		}
	};

	

	const Address = async () => {
    try {
        const result = await fetchJapaneseAddress(formData.zip_code);
        if (result) {
            setFormData(prev => ({
                ...prev,
                address: result.address,
                zip_code: result.zip_code
            }));
        } else {
            alert("該当する住所が見つかりませんでした。");
        }
    } catch (error) {
        console.error("Address fetch error:", error);
    }
	};



	const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


	const deliveryOptions = [
		"選択しない",
		"警備員に渡してください。",
		"チャイムを鳴らさないでください。",
		"直接受け取りたいです。",
		"宅配ボックスに入れてください。",
		"犬が吠えます。注意してください。",
		"直接入力"

	];
	const paymentOptions = [
		"クレジットカード",
		"銀行振込",
		"PayPay",
		"PayPal",
		"コンビニ支払い",
		"アマゾンペイ",
		"楽天ペイ"
	];
	const [paymentMethod, setPaymentMethod] = useState("");

    return {
    url, items, success, error,
    deliveryRequest, setDeliveryRequest, deliveryRequestText,
    setDeliveryRequestText, handleOrder, deliveryOptions, paymentOptions,
	paymentMethod, setPaymentMethod, open ,setOpen, formData, handleChange,
	Address
    };
};