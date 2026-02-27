import {
	Modal, Box, Typography,
	Button, TextField,
	Paper, Divider,
	Stack, Alert,
	Table, TableHead,
	TableRow, TableCell,
	TableBody, FormControl,
	InputLabel, Select,
	MenuItem
} from "@mui/material";
import { useBuy } from "../hooks/useBuy";

function BuyPage() {
	const {
    url, items, success, error,
    deliveryRequest, setDeliveryRequest, deliveryRequestText,
    setDeliveryRequestText, handleOrder, deliveryOptions, paymentOptions,
	paymentMethod, setPaymentMethod, open ,setOpen, formData, handleChange,
	fetchJapaneseAddress
  	} = useBuy(); //임포트해서 리턴한 객체들 가져옴


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
									value={formData.receiver_name} //폼데이터 저장
        							onChange={handleChange}
								/>
								<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
      							<TextField 
        							label="郵便番号" 
        							name="zip_code" 
        							value={formData.zip_code || ''}
									onChange={handleChange}
									placeholder="1234567"
      							/>
      							<Button variant="contained"
										onClick={() => fetchJapaneseAddress(formData.zip_code)}>
        							住所検索
      							</Button>
    							</Box>
						<TextField 
      					  fullWidth 
      					  label="住所" 
      					  name="address" 
      					  value={formData.address || ''} 
      					  margin="normal" 
      					  InputProps={{ readOnly: true }} 
    					/>

    					<TextField 
      					  fullWidth 
      					  label="詳細住所" 
      					  name="address_detail" 
						  value={formData.address_detail}
      					  margin="normal" 
      					  onChange={handleChange} 
    					/>

    					<Modal open={open} onClose={() => setOpen(false)}>
      					<Box sx={{ 
        					position: 'absolute', top: '50%', left: '50%', 
        					transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 1 
      					}}>
        					
      					</Box>
    					</Modal>
								<TextField
									label="連絡先"
									name="phone"
									required
									fullWidth
									value={formData.phone}         
        							onChange={handleChange}
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
