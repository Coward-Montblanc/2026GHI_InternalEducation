import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, MenuItem, Select, FormControl, 
  InputLabel, Typography, Paper, Grid, Divider, Chip, Stack,
  IconButton, Card, CardContent
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { fetchJapaneseAddress } from '../utils/address';

const AdminOrderEditPage = () => {
  const url = import.meta.env.VITE_API_URL;
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [searchZip, setSearchZip] = useState('');
    
  // 0=注文キャンセル, 1=注文完了（準備中）, 2=配送中, 3=配送完了 
  //返品、払い戻しステータスもstatusに追加する必要があります（予定）
  const statusOptions = [
    { value: 0, label: '注文キャンセル', color: "error" },
    { value: 1, label: '注文完了（準備中）', color: "primary" },
    { value: 2, label: '配送中', color: "info" },
    { value: 3, label: '配送完了', color: "success" }
  ];

  const [orderData, setOrderData] = useState({
    status: 1,
    receiver_name: '',
    phone: '',
    address: '',
    address_detail: '',
    delivery_request: '',
    total_price: 0,
    login_id: '',
    created_at: ''
    
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/admin/${orderId}`);
        if (res.data.success) {
          const { order, items } = res.data;
          setOrderData({
            status: order.status,
            receiver_name: order.receiver_name,
            phone: order.phone,
            address: order.address,
            address_detail: order.address_detail,
            delivery_request: order.delivery_request || '',
            total_price: order.total_price || 0,
            login_id: order.login_id || '',
            created_at: order.created_at || ''
          });
          setOrderItems(items);
        }
      } catch (err) {
        alert("データの読み込み中にエラーが発生しました。");
      }
    };
    fetchOrder();
  }, [orderId]);

  const Address = async () => {
    const cleanZip = searchZip.replace(/[^0-9]/g, '');
        if (cleanZip.length !== 7) {
        alert("郵便番号7桁(数字のみ)を入力してください。");
        return;
      }
      try {
          const result = await fetchJapaneseAddress(cleanZip);
          if (result) {
              setOrderData(prev => ({
                  ...prev,
                  address: result.address
              }));
            //alert창 중복표시, 삭제
          }
      } catch (error) {
          console.error("Address fetch error:", error);
      }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.patch(`/api/orders/admin/${orderId}`, orderData);
      if (res.data.success) {
        alert("注文情報が更新されました。");
        navigate('/admin/orders');
      }
    } catch (err) {
      console.error(err);
      alert("更新に失敗しました。");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, margin: '0 auto' }}>
      {/* 上部ヘッダ領域 */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>注文修正</Typography>
          <Typography variant="body2" color="text.secondary">ID: {orderId} | {orderData.login_id}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Chip 
          label={statusOptions.find(opt => opt.value === orderData.status)?.label} 
          color={statusOptions.find(opt => opt.value === orderData.status)?.color}
          sx={{ fontWeight: 'bold', px: 2 }}
        />
      </Stack>
      
          <Stack spacing={3} >
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 3, mt: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>注文商品</Typography>
                    <Chip label={`${orderItems.length}件`} size="small" variant="outlined" sx={{ ml: 1 }} />
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2} >
                    {orderItems.map((item, index) => (
                        <Box 
                            key={item.product_id || index} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                p: 2, 
                                bgcolor: '#fcfcfc', 
                                borderRadius: 2,
                                border: '1px solid #f0f0f0'
                            }}
                            >
                        <Box 
                            component="img"
                            src={item.image_url ? `${url}${item.image_url}` : '/No_Image.png'} 
                            sx={{ 
                                width: 60, 
                                height: 60, 
                                borderRadius: 1, 
                                objectFit: 'cover', 
                                mr: 2, 
                                bgcolor: '#eee',
                                border: '1px solid #eee' 
                            }}
                            onError={(e) => { e.target.src = '/No_Image.png'; }} //商品画像がない、またはロードできない場合
                        />

                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {item.product_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                            単価: ¥{Number(item.price).toLocaleString()}
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {item.quantity} 個
                            </Typography>
                            <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800 }}>
                            ¥{Number(item.price * item.quantity).toLocaleString()}
                            </Typography>
                        </Box>
                        </Box>
                    ))}
                    </Stack>

                    {orderItems.length > 0 && (
                    <Box 
                        sx={{ 
                            mt: 2, 
                            p: 3,
                            bgcolor: '#f8f9fa', 
                            borderRadius: 3, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            border: '1px solid #eee'
                            }}
                        >
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 1000, color: 'text.secondary', mb: 0.7 }}>
                                商品合計
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                注文日時: {new Date(orderData.created_at).toLocaleString()}
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                                variant="h4"
                                sx={{ 
                                    fontWeight: 900, 
                                    color: 'error.main',
                                    letterSpacing: -0.5 
                                }}
                            >
                            ¥{orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                    )}
                </CardContent>
            </Card>
            {/* 注文ステータス */}
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>注文ステータス</Typography>
                </Stack>
                <FormControl fullWidth>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    name="status"
                    value={orderData.status}
                    label="ステータス"
                    onChange={handleChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {statusOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* 配送情報 */}
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ maxWidth: 700, ml: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LocalShippingIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>配送先情報</Typography>
                </Stack>
                <Stack spacing={3} sx={{ maxWidth: 700, mx: 'auto' }}>
                    <TextField fullWidth label="受取人" name="receiver_name" value={orderData.receiver_name} onChange={handleChange} variant="filled" />
                    <TextField fullWidth label="連絡先" name="phone" value={orderData.phone} onChange={handleChange} variant="filled" />
                <Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                    郵便番号（数字7桁制限） 
                </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField 
                        sx={{ width: 180 }} 
                        label="1000000" 
                        value={searchZip} 
                        onChange={(e) => setSearchZip(e.target.value)}
                        variant="filled" 
                        inputProps={{ maxLength: 7 }}
                    />
                    <Button 
                        variant="contained"
                        onClick={Address}
                        sx={{ px: 3, fontWeight: 'bold', whiteSpace: 'nowrap' }}
                    >
                        住所検索
                    </Button>
                    </Stack>

                    <Stack spacing={1.5}>
                    <TextField 
                        fullWidth 
                        label="住所" 
                        name="address" 
                        value={orderData.address} 
                        onChange={handleChange} 
                        variant="filled" 
                    />
                    <TextField 
                        fullWidth 
                        label="詳細住所" 
                        name="address_detail" 
                        value={orderData.address_detail} 
                        onChange={handleChange} 
                        variant="filled" 
                    />
                    </Stack>
                </Box>
                    <TextField fullWidth label="配送要請事項" name="delivery_request" value={orderData.delivery_request} onChange={handleChange} variant="filled" />
                </Stack>
              </CardContent>
            </Card>
          
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2, mb: 5 }}>
            <Button 
                variant="contained" 
                size="large" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
            変更内容を保存
            </Button>
            <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
            キャンセル
            </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AdminOrderEditPage;