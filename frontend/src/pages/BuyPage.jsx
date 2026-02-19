import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Box, Typography,
	Button, TextField,
	Paper, Divider,
	Stack, Alert,
	Table, TableHead,
	TableRow, TableCell,
	TableBody, FormControl,
	InputLabel, Select,
	MenuItem
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { createOrder } from "../services/OrderService";

function BuyPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	
	// BuyService에서 항상 items 배열로 넘기도록 통일
	const { items = [] } = location.state || {};
	
	const url = import.meta.env.VITE_API_URL; //.env파일에서 가져온 url
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [deliveryRequest, setDeliveryRequest] = useState("");
	const [deliveryRequestText, setDeliveryRequestText] = useState("");

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
				setTimeout(() => navigate("/"), 10000); //10초 뒤에 홈으로 이동
			} else {
				setError("注文に失敗しました。もう一度お試しください。");
			}
		} catch (err) {
			setError(err.response?.data?.message || "注文処理中にエラーが発生しました。");
		}
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

	return (
		<Box sx={{ p: 5, maxWidth: 1200, margin: "40px auto" }}>
			<Stack spacing={4}>
				{/* 상품 정보 상자 */}
				<Paper sx={{ p: 3 }} elevation={4}>
					<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>購入商品一覧</Typography>
					<Table sx={{ minWidth: 650 }}>
						<TableHead>
							<TableRow sx={{ background: '#f5f5f5' }}>
								<TableCell align="center">商品写真</TableCell>
								<TableCell align="center">商品名</TableCell>
								<TableCell align="center">数量</TableCell>
								<TableCell align="center">価格</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((item) => (
								<TableRow key={item.cart_item_id || item.product_id}>
									<TableCell align="center">
										<img src={`${url}${item.image_url}`} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
									</TableCell>
									<TableCell>{item.name}</TableCell>
									<TableCell align="center">{item.quantity}</TableCell>
									<TableCell align="right">{(item.price * item.quantity).toLocaleString()}円</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Box sx={{ textAlign: 'right', mt: 10 }}>
						<Typography variant="h5">総支払金額</Typography>
						<Typography variant="h4"><b>{items.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()}円</b></Typography> 
					</Box>
				</Paper>

				<form onSubmit={handleOrder}>
					<Stack spacing={4}>
						{/* 배송지 정보 입력 상자 */}
						<Paper sx={{ p: 4 }} elevation={2}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>配送先</Typography>
							<Divider sx={{ mb: 3 }} />
							<Stack spacing={2}>
								<TextField
									label="名前"
									name="receiver_name"
									required
									fullWidth
								/>
								<TextField
									label="住所"
									name="address"
									required
									fullWidth
								/>
								<TextField
									label="詳細住所"
									name="address_detail"
									fullWidth
								/>
								<TextField
									label="連絡先"
									name="phone"
									required
									fullWidth
								/>
							</Stack>
						</Paper>

						{/* 배송요청사항 입력 상자 */}
						<Paper sx={{ p: 4 }} elevation={2}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>配送リクエスト選択</Typography>
							<Divider sx={{ mb: 3 }} />
							<FormControl fullWidth sx={{ mb: 1 }}>
								<InputLabel id="delivery-request-select-label">配送リクエスト</InputLabel>
								<Select
									labelId="delivery-request-select-label"
									id="delivery-request-select"
									value={deliveryRequest}
									label="配送リクエスト"
									onChange={e => setDeliveryRequest(e.target.value)}
								>
									{deliveryOptions.map(option => (
										<MenuItem key={option} value={option}>{option}</MenuItem>
									))}
								</Select>
							</FormControl>

							{deliveryRequest === "直接入力" && (
								<TextField
									label="配送リクエスト直接入力"
									name="deliveryRequestText"
									required
									fullWidth
									value={deliveryRequestText}
									onChange={e => setDeliveryRequestText(e.target.value)}
									sx={{ mt: 1 }}
								/>
							)}
						</Paper>

						{/* 결제방법 입력 상자 */}
						<Paper sx={{ p: 4 }} elevation={2}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>支払い方法選択</Typography>
							<Divider sx={{ mb: 3 }} />
							<FormControl fullWidth sx={{ mb: 1 }}>
								<InputLabel id="payment-method-select-label">支払い方法</InputLabel>
								<Select
									labelId="payment-method-select-label"
									id="payment-method-select"
									value={paymentMethod}
									label="支払い方法"
									onChange={e => setPaymentMethod(e.target.value)}
								>
									{paymentOptions.map(option => (
										<MenuItem key={option} value={option}>{option}</MenuItem>
									))}
								</Select>
							</FormControl>
						</Paper>

						<Button type="submit" variant="contained" size="large" color="primary" fullWidth sx={{ mt: 2 }}>
							支払い
						</Button>
						
						{success && <Alert severity="success" sx={{ mb: 2 }}>注文が完了しました！もうすぐホームに戻ります。</Alert>}
					</Stack>
				</form>
			</Stack>
		</Box>
	);
}

export default BuyPage;
