import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../services/OrderService";
import { useAuth } from "../contexts/AuthContext";
import { fetchJapaneseAddress } from "../utils/address";
import { validateOrderForm } from "../utils/validation";

export const useBuy = () => {
    const navigate = useNavigate();
    const location = useLocation();
	const { user } = useAuth();
	const [formData, setFormData] = useState({
        receiver_name: "",
        zip_code: "",
        address: "",
        address_detail: "",
        phone: "",
		payment_method: ""
    });

	const { items = [] } = location.state || {};
	
	const url = import.meta.env.VITE_API_URL; //.envファイルから取得したurl
	const [errors, setErrors] = useState({});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [deliveryRequest, setDeliveryRequest] = useState("");
	const [deliveryRequestText, setDeliveryRequestText] = useState("");
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	const handleOrder = async (e) => {
		if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    	}
    
		setError("");
		setErrors({});
		setSuccess(false);
		setIsSubmitting(true);

		const { isValid, errors: tempErrors } = validateOrderForm(formData, paymentMethod);

        if (!isValid) {
            setErrors(tempErrors);
			setIsSubmitting(false);
            return;
        }

		const {
			receiver_name,
			address,
			address_detail,
			phone,
			payment_method
		} = formData;

		if (!user) {
			setError("ログインが必要です。");
			setIsSubmitting(false);
			return;
		}
		if (!receiver_name || !address || !phone || !payment_method) {
			setError("必須情報をすべて入力してください。");
			setIsSubmitting(false);
			return;
		}

		const total_price = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
		const delivery_request = deliveryRequest === "直接入力" ? deliveryRequestText : (deliveryRequest || "");

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
				address_detail: address_detail || "",
				phone,
				delivery_request,
				payment_method
			});
			if (res.success && res.order_id) {
				setSuccess(true);
				await new Promise((r) => setTimeout(r, 2000));
				navigate("/order-confirm", { state: { order_id: res.order_id } });
			} else {
				setError("注文に失敗しました。もう一度お試しください。");
				setIsSubmitting(false);
			}
		} catch (err) {
			setError(err.response?.data?.message || "注文処理中にエラーが発生しました。");
			setIsSubmitting(false);
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
			//alert창 중복표시, 삭제
			setErrors(prev => ({ ...prev, address: "", zip_code: "" }));
        }
    	} catch (error) {
        	console.error("Address fetch error:", error);
    	}
	};

	const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
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
    url, items, success, error, isSubmitting,errors, setErrors,
    deliveryRequest, setDeliveryRequest, deliveryRequestText,
    setDeliveryRequestText, handleOrder, deliveryOptions, paymentOptions,
	paymentMethod, setPaymentMethod, open ,setOpen, formData, handleChange,
	Address, setFormData
    };
};