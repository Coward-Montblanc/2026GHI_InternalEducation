import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, InputAdornment
} from '@mui/material';
import api from '../../api/axios';
import { fetchJapaneseAddress } from '../../utils/address';　//주소 유틸파일

export const AddressEditModal = ({ open, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        address_name: '',
        receiver_name: '',
        zip_code: '',
        address: '',
        address_detail: '',
        phone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const Address = async () => {
    try {
        if (formData.zip_code.replace(/[^0-9]/g, '').length !== 7) {
            alert("郵便番号7桁を入力してください。");
            return;
        }
        const result = await fetchJapaneseAddress(formData.zip_code);
        if (result) {
            setFormData(prev => ({
                ...prev,
                address: result.address,
                zip_code: result.zip_code
            }));
        }
    } catch (error) {
        console.error("Address fetch error:", error);
    }
	};


    const handleSubmit = async () => {
        try {
            await api.post("/users/addresses", formData);
            alert("新しい配送先が登録されました。");
            onSave();
            onClose(); 
            setFormData({ address_name: '', receiver_name: '', zip_code: '', address: '', address_detail: '', phone: '' });
        } catch (err) {
            console.error("配送先の追加に失敗しました：", err);
            alert(err.response?.data?.message || "配送先の追加に失敗しました。");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold' }}>配送先の追加</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField label="配送先名 (例 : ご自宅, 会社など)" name="address_name" fullWidth value={formData.address_name} onChange={handleChange} />
                    <TextField label="受け取り人" name="receiver_name" fullWidth value={formData.receiver_name} onChange={handleChange} />
                    <TextField 
                        label="郵便番号" 
                        name="zip_code" 
                        fullWidth 
                        value={formData.zip_code} 
                        onChange={handleChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button onClick={Address} variant="contained" size="small">
                                        検索
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField label="住所" name="address" fullWidth value={formData.address} onChange={handleChange} />
                    <TextField label="詳細住所" name="address_detail" fullWidth value={formData.address_detail} onChange={handleChange} />
                    <TextField label="連絡先" name="phone" fullWidth value={formData.phone} onChange={handleChange} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} color="inherit">キャンセル</Button>
                <Button onClick={handleSubmit} variant="contained">保存する</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressEditModal;