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

//정보값 저장은 아직 안됩니다. Order데이터 모델 구현 후 백엔드와 연동 필요

function BuyPage() {
	const navigate = useNavigate();
	const location = useLocation();
	// 메인에서는 단일상품만 받아오고, 장바구니에서는 여러 상품을 받아오다보니 오류가 나는 경우가 있어 합칩니다.
	let { cartItems, product, quantity } = location.state || {};

	if ((!cartItems || cartItems.length === 0) && product && quantity) {
		cartItems = [{
			cart_item_id: product._id || product.id || 'single',
			image_url: product.image_url || product.main_image || '',
			name: product.name,
			quantity: quantity,
			price: product.price
		}];
	}
	
	const url = import.meta.env.VITE_API_URL; //.env파일에서 가져온 url
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [deliveryRequest, setDeliveryRequest] = useState("");
	const [deliveryRequestText, setDeliveryRequestText] = useState("");

	// 실제 기능 추가 전, 성공 처리만 하기 위해 두는 함수
	const handleOrder = (e) => {
		e.preventDefault(); //submit 방지
		setSuccess(true); //결제 성공으로만 바꿔줌
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

	// 서버상 재고가 사라지면 뜨는 창
	if (!cartItems || cartItems.length === 0) {
		return (
			<Box sx={{ p: 5, maxWidth: 500, margin: "40px auto" }}>
				<Paper sx={{ p: 4 }} elevation={3}>
					<Typography variant="h5" sx={{ mb: 2 }}>申し訳ございません。在庫切れです。</Typography>
					<Button variant="contained" onClick={() => navigate(-1)}>前へ</Button>
				</Paper>
			</Box>
		);
	}

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
							{cartItems.map((item) => (
								<TableRow key={item.cart_item_id}>
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
						<Typography variant="h4"><b>{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()}円</b></Typography> 
						{/* for / while과 같은거, let total = 0;
								for (const item of cartItems) {
  								total += item.price * item.quantity;
								}로 생각하면 됨 */}
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
									name="name"
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
						
						{success && <Alert severity="success" sx={{ mb: 2 }}>注文が完了しました！</Alert>}
					</Stack>
				</form>
			</Stack>
		</Box>
	);
}

export default BuyPage;
