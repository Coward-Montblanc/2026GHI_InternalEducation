import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../services/OrderService";
import { useAuth } from "../contexts/AuthContext";

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

		// 구매 데이터
		const formData = new FormData(e.target);
		const receiver_name = formData.get("receiver_name");
		const address = formData.get("address");
		const address_detail = formData.get("address_detail");
		const phone = formData.get("phone");
		const delivery_request = deliveryRequest === "直接入力" ? deliveryRequestText : deliveryRequest;
		const payment_method = paymentMethod;

		
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

	

	const fetchJapaneseAddress = async (zipCode) => { //일본 우편번호 검색하는 함수
    const cleanZip = zipCode.replace('-', ''); //7자리 숫자로만 우편번호 검색
    if (cleanZip.length !== 7) return; 

    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`); //api주소
        const data = await response.json();
        if (data.results) {
            const res = data.results[0];
            const fullAddr = `${res.address1}${res.address2}${res.address3}`;
            setFormData(prev => ({
                ...prev,
                address: fullAddr,
                zip_code: cleanZip
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
	fetchJapaneseAddress
    };
};