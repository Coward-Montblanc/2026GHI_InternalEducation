import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Stack, Grid, Pagination 
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LoadingView } from "../components/LoadingCircle";
import { getAdminOrders } from "../services/OrderService";

const ITEMS_PER_PAGE = 10;

function AdminOrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchType, setSearchType] = useState("order_id"); 
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    startDate: null,
    endDate: null,
    searchTerm: "" 
  });

  const fetchAdminOrders = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      limit: ITEMS_PER_PAGE,
      status: filters.status !== "" ? filters.status : undefined,
      [searchType]: filters.searchTerm || undefined,
      startDate: filters.startDate ? filters.startDate.format("YYYY-MM-DD") : undefined,
      endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : undefined,
    };

  if (filters.searchTerm) {
    params[searchType] = filters.searchTerm;
  }

    getAdminOrders(params)
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    }, [page, filters, searchType]);
  
  useEffect(() => {
    fetchAdminOrders();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchAdminOrders();
  };

  const getStatusChip = (status) => {//임시 색상표, 테이블 내 상태에 맞춰서 사용하면 될듯.
    const statusMap = {
      0: { label: "注文キャンセル", color: "error", variant: "outlined" },
      1: { label: "注文完了(準備中)", color: "primary", variant: "outlined" },
      2: { label: "配送中", color: "info", variant: "filled" },
      3: { label: "配送完了", color: "success", variant: "filled" },
    };
    const target = statusMap[status] || { label: "不明", color: "default" };
    return <Chip label={target.label} color={target.color} size="small" variant="outlined" />;
  };

  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー注文管理</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#fcfcfc" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} alignItems="center">
            
            {/* 대분류 검색 */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>検索項目</InputLabel>
                <Select
                  value={searchType}
                  label="検索項目"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <MenuItem value="order_id">注文番号</MenuItem> 
                  <MenuItem value="login_id">ユーザーID</MenuItem>
                  <MenuItem value="receiver_name">受取人名</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 기간 검색 (캘린더) */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DatePicker
                  sx={{ width: '150px' }}
                  label="～から"
                  slotProps={{ textField: { size: 'small' } }}
                  value={filters.startDate}
                  onChange={(v) => setFilters({ ...filters, startDate: v })}
                />
                <Typography>~</Typography>
                <DatePicker
                  sx={{ width: '150px' }}
                  label="～まで"
                  slotProps={{ textField: { size: 'small' } }}
                  value={filters.endDate}
                  onChange={(v) => setFilters({ ...filters, endDate: v })}
                />
              </Stack>
            </Grid>

            {/* 주문 상태 */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>状態</InputLabel>
                <Select
                  sx={{ width: '100px' }}
                  value={filters.status}
                  label="ステータス"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">すべて</MenuItem>
                  <MenuItem value="1">注文完了</MenuItem>
                  <MenuItem value="2">配送中</MenuItem>
                  <MenuItem value="3">配送完了</MenuItem>
                  <MenuItem value="0">キャンセル</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 검색 텍스트 필드 */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="検索キーワード"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>

            {/* 검색 버튼 */}
            <Grid item xs={12} md={1}>
              <Button 
                fullWidth 
                variant="contained"
                onClick={handleSearch}
                sx={{ height: '40px' }}
              >
                検索
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: 2, bgcolor: "#fff" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell align="center">注文番号</TableCell>
                <TableCell align="center">ユーザーID</TableCell>
                <TableCell align="center">合計金額</TableCell>
                <TableCell align="center">受取人</TableCell>
                <TableCell align="center">配送先</TableCell>
                <TableCell align="center">連絡先</TableCell>
                <TableCell align="center">状態</TableCell>
                <TableCell align="center">注文日</TableCell>
                <TableCell align="center">管理</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>該当する注文がありません。</TableCell>
                </TableRow>
              ) : (
                orders.map((row) => (
                  <TableRow key={row.order_id} hover>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>{row.order_id}</TableCell>
                    <TableCell align="center">{row.login_id}</TableCell>
                    <TableCell align="right">¥{Number(row.total_price).toLocaleString()}</TableCell>
                    <TableCell align="center">{row.receiver_name}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.address} {row.address_detail}
                    </TableCell>
                    <TableCell align="center">{row.phone}</TableCell>
                    <TableCell align="center">{getStatusChip(row.status)}</TableCell>
                    <TableCell align="center">{dayjs(row.created_at).format("YYYY-MM-DD")}</TableCell>
                    <TableCell align="center">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/admin/orders/edit/${row.order_id}`)}
                          sx={{ 
                            borderRadius: '20px', 
                            fontSize: '0.75rem',
                            textTransform: 'none' 
                          }}
                        >
                          修正
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, v) => setPage(v)} 
            color="primary" 
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminOrderManagement;
