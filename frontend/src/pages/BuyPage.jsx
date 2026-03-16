import {
	Modal, Box, Typography,
	Button, TextField,
	Paper, Divider,
	Stack, Alert,
	FormControl,
	InputLabel, Select,
	MenuItem
} from "@mui/material";
import { useBuy } from "../hooks/useBuy";
import { useAddressSelection } from "../hooks/useAddressSelection";
import OrderList from "../components/OrderList";
import { LoadingView } from "../components/LoadingCircle";
import { AddressSelectModal } from "../components/modals/AddressSelectModal";

function BuyPage() {
	const {
		url, items, error, isSubmitting,
		deliveryRequest, setDeliveryRequest, deliveryRequestText,
		setDeliveryRequestText, handleOrder, deliveryOptions, paymentOptions,
		paymentMethod, setPaymentMethod, open, setOpen, formData, handleChange,
		Address, setFormData
	} = useBuy();

	const {
        isAddrModalOpen,
        openAddrModal,
        closeAddrModal,
        handleSelectAddress
    } = useAddressSelection(setFormData);

	return ( //로딩 오버레이
		<Box sx={{ p: 5, maxWidth: 1200, margin: "40px auto", position: "relative" }}>
			{isSubmitting && ( <LoadingView/> )}
			<Stack spacing={4}>
				{/* 상품 정보 상자 */}
					<OrderList items={items} url={url} linkToProduct={true} />

				<form onSubmit={handleOrder}>
					<Stack spacing={4}>
						{error && <Alert severity="error">{error}</Alert>}
						{/* 배송지 정보 입력 상자 */}
						<Paper sx={{ p: 4 }} elevation={2}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>配送先</Typography>
							<Divider sx={{ mb: 3 }} />
							<Stack spacing={2}>
								<Button variant="outlined" onClick={() => openAddrModal(true)}>配送先変更</Button>
							<AddressSelectModal 
    							open={isAddrModalOpen}
    							onClose={closeAddrModal}
    							onSelect={handleSelectAddress}
							/>
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
									required 
        							value={formData.zip_code || ''}
									onChange={handleChange}
									placeholder="1234567"
      							/>
      							<Button variant="contained"
										onClick={() => Address(formData.zip_code)}>
        							住所検索
      							</Button>
    							</Box>
						<TextField 
      					  fullWidth 
      					  label="住所" 
      					  name="address" 
						  required
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
									required
									onChange={e => {
										setPaymentMethod(e.target.value);
										setFormData({ ...formData, payment_method: e.target.value });
									}}
								>
									{paymentOptions.map(option => (
										<MenuItem key={option} value={option}>{option}</MenuItem>
									))}
								</Select>
							</FormControl>
						</Paper>

						<Button
							type="submit"
							variant="contained"
							size="large"
							color="primary"
							fullWidth
							sx={{ mt: 2 }}
							disabled={isSubmitting}
						>
							支払い
						</Button>
					</Stack>
				</form>
			</Stack>
		</Box>
	);
}

export default BuyPage;
