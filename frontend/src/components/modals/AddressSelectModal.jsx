import api from "../../api/axios";
import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, List, ListItem,
    ListItemText, ListItemButton, Button, Typography, Divider, Box
} from '@mui/material';
import { AddressEditModal } from "./AddressEditModal";

export const AddressSelectModal = ({ open, onClose, onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchAddresses = async () => {
                try {
                    const res = await api.get("/users/addresses");
                    setAddresses(res.data);
                } catch (err) {
                    console.error("配送先の読み込みに失敗しました。：", err);
                }
  };

  useEffect(() => { if (open) { fetchAddresses(); } }, [open] );

  const handleSetDefault = async (addrName) => {
    try {
        await api.patch("/users/addresses/default", { address_name: addrName });
        alert("メイン配送先が変更されました。");
        fetchAddresses(); // 목록 새로고침
    } catch (err) {
        console.error("変更中にエラーが発生しました : ", err);
        alert("変更中にエラーが発生しました。");
    }
  };

  return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>お届け先の選択</DialogTitle>
            <Divider />
            <DialogContent>
                <List>
                    {addresses.length > 0 ? (
                        addresses.map((addr) => (
                            <ListItem 
                                key={addr.address_name} 
                                disablePadding
                                sx={{ borderBottom: '1px solid #eee' }}
                                secondaryAction={
                                    addr.is_default !== 1 && ( 
                                        <Button 
                                            size="small" 
                                            variant="outlined"
                                            onClick={(e) => {
                                            e.stopPropagation();
                                                handleSetDefault(addr.address_name);
                                            }}
                                        >
                                        メイン配送先変更
                                        </Button>
                                    )
                                }
                            >
                                <ListItemButton onClick={() => onSelect(addr)}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}> {addr.address_name} </Typography>
                                                {addr.is_default === 1 && ( <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, borderRadius: 1 }}> メイン配送先 </Typography> )}
                                            </Box>
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                        secondary={ <Box component="div"> 
                                                    <Typography variant="body2" component="div"> {addr.receiver_name} | {addr.phone} </Typography>
                                                    <Typography variant="body2" component="div" color="text.secondary"> ({addr.zip_code}) {addr.address} {addr.address_detail} </Typography> </Box>
                                        } />
                                </ListItemButton>
                            </ListItem>
                        ))
                    ) : (
                        <Typography sx={{ py: 4, textAlign: 'center' }}>
                            登録された配送先がありません。
                        </Typography>
                    )}
                </List>
                
                <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => setIsEditOpen(true)} >
                    配送先を追加する。
                </Button>
                <AddressEditModal 
                    open={isEditOpen} 
                    onClose={() => setIsEditOpen(false)} 
                    onSave={fetchAddresses} // 저장 성공 시 목록 다시 불러오기
                />
            </DialogContent>
        </Dialog>
    );
};

export default AddressSelectModal;