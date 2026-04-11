import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, MenuItem, Select, 
  FormControl, InputLabel, Stack, Grid, Pagination, TableSortLabel, Collapse
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ExpandMore, ExpandLess, RestartAlt, Search } from '@mui/icons-material';
import { LoadingView } from "../components/LoadingCircle";
import { getAdminOrders } from "../services/OrderService";

const ITEMS_PER_PAGE = 10;

const initialFilters = {
  order_id: "",
  login_id: "",
  receiver_name: "",
  status: "all",
  searchTerm: "",
  minPrice: "",
  maxPrice: "",
  address: "",
  phone: "",
  startDate: null,
  endDate: null,
  startUpdateDate: null,
  endUpdateDate: null
};

function AdminOrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("desc"); 
  const [orderBy, setOrderBy] = useState("created_at"); 
  const [searchType, setSearchType] = useState("order_id"); 
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialFilters);

  const fetchAdminOrders = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      limit: ITEMS_PER_PAGE,
      sortField: orderBy,
      sortOrder: order.toUpperCase(),
    };

    const addFilter = (key, value) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params[key] = value;
      }
    };

    addFilter("status", searchQuery.status);
    addFilter("minPrice", searchQuery.minPrice);
    addFilter("maxPrice", searchQuery.maxPrice);
    addFilter("address", searchQuery.address);
    addFilter("phone", searchQuery.phone);

    if (searchQuery.searchTerm) {
      params[searchType] = searchQuery.searchTerm;
    } else {
      addFilter("order_id", searchQuery.order_id);
      addFilter("login_id", searchQuery.login_id);
      addFilter("receiver_name", searchQuery.receiver_name);
    }

    if (searchQuery.startDate) params.startDate = searchQuery.startDate.format("YYYY-MM-DD");
    if (searchQuery.endDate) params.endDate = searchQuery.endDate.format("YYYY-MM-DD");
    if (searchQuery.startUpdateDate) params.startUpdateDate = searchQuery.startUpdateDate.format("YYYY-MM-DD");
    if (searchQuery.endUpdateDate) params.endUpdateDate = searchQuery.endUpdateDate.format("YYYY-MM-DD");

    getAdminOrders(params)
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, searchQuery, searchType, order, orderBy]);
  
  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery({ ...filters });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setSearchQuery(initialFilters);
    setPage(1);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      0: { label: "注文キャンセル", color: "error" },
      1: { label: "注文完了", color: "primary" },
      2: { label: "配送中", color: "info" },
      3: { label: "配送完了", color: "success" },
    };
    const target = statusMap[status] || { label: "不明", color: "default" };
    return <Chip label={target.label} color={target.color} size="small" variant="outlined" />;
  };

  if (loading && page === 1 && orders.length === 0) return <LoadingView />;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー注文管理</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff" }}>
        {/* 簡単検索 */}
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>注文番号</Typography>
            <TextField fullWidth size="small" placeholder="ID" value={filters.order_id} onChange={(e) => setFilters({ ...filters, order_id: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>ユーザーID</Typography>
            <TextField fullWidth size="small" placeholder="Login ID" value={filters.login_id} onChange={(e) => setFilters({ ...filters, login_id: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>受取人</Typography>
            <TextField fullWidth size="small" placeholder="名前" value={filters.receiver_name} onChange={(e) => setFilters({ ...filters, receiver_name: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>상태</Typography>
            <FormControl fullWidth size="small">
              <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="1">注文完了</MenuItem>
                <MenuItem value="2">配送中</MenuItem>
                <MenuItem value="3">配送完了</MenuItem>
                <MenuItem value="0">キャンセル</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>キーワード</Typography>
            <TextField fullWidth size="small" placeholder="キーワード" value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              sx={{ height: '40px', fontWeight: 'bold' }}
            >検索</Button>
            <Button
              variant="outlined" color="inherit"
              onClick={() => setShowDetail(!showDetail)}
              sx={{ height: '40px', minWidth: '50px' }}
            >
              {showDetail ? <ExpandLess /> : <ExpandMore />}
            </Button>
          </Grid>
        </Grid>

        {/* 詳細検索 */}
        <Collapse in={showDetail}>
          <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #eee" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>合計金額範囲</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField size="small" placeholder="最小" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                  <Typography>~</Typography>
                  <TextField size="small" placeholder="最大" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>配送先・連絡先</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField fullWidth size="small" placeholder="配送先" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
                  <TextField fullWidth size="small" placeholder="連絡先" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>注文期間</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.startDate} onChange={(v) => setFilters({ ...filters, startDate: v })} />
                    <Typography>~</Typography>
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.endDate} onChange={(v) => setFilters({ ...filters, endDate: v })} />
                  </Stack>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>更新期間(確定日)</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.startUpdateDate} onChange={(v) => setFilters({ ...filters, startUpdateDate: v })} />
                    <Typography>~</Typography>
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.endUpdateDate} onChange={(v) => setFilters({ ...filters, endUpdateDate: v })} />
                  </Stack>
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained" color="error"
                  startIcon={<RestartAlt />}
                  onClick={handleReset}
                  sx={{ fontWeight: 'bold', borderRadius: '8px' }}
                >リセット</Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        <TableContainer>
         <Table size="small">
            <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5", "& th": { whiteSpace: "nowrap", fontWeight: 700 } }}>
               <TableCell align="center">
                 <TableSortLabel active={orderBy === "order_id"} direction={orderBy === "order_id" ? order : "asc"} onClick={() => handleRequestSort("order_id")}>
                   注文番号
                 </TableSortLabel>
                </TableCell>
               <TableCell align="center">ユーザーID</TableCell>
               <TableCell align="center">
                 <TableSortLabel active={orderBy === "total_price"} direction={orderBy === "total_price" ? order : "asc"} onClick={() => handleRequestSort("total_price")}>
                   合計金額
                 </TableSortLabel>
                </TableCell>
               <TableCell align="center">受取人</TableCell>
               <TableCell align="center">配送先 / 連絡先</TableCell>
               <TableCell align="center">状態</TableCell>
               <TableCell align="center">
                  <TableSortLabel active={orderBy === "created_at"} direction={orderBy === "created_at" ? order : "asc"} onClick={() => handleRequestSort("created_at")}>
                    注文日
                  </TableSortLabel>
               </TableCell>
               <TableCell align="center">
                 <TableSortLabel active={orderBy === "updated_at"} direction={orderBy === "updated_at" ? order : "asc"} onClick={() => handleRequestSort("updated_at")}>
                    変更日
                 </TableSortLabel>
               </TableCell>
               <TableCell align="center">管理</TableCell>
             </TableRow>
           </TableHead>
            <TableBody>
                      {orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                   該当する注文が見つかりません。
                 </TableCell>
               </TableRow>
             ) : (
               orders.map((row) => (
                 <TableRow key={row.order_id} hover>
                   <TableCell align="center" sx={{ fontWeight: 'bold' }}>{row.order_id}</TableCell>
                    <TableCell align="center">{row.login_id}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                     ¥{Number(row.total_price).toLocaleString()}
                   </TableCell>
                    <TableCell align="center">{row.receiver_name}</TableCell>
                    
                    <TableCell align="left" sx={{ maxWidth: '200px' }}>
                     <Typography variant="body2" noWrap title={`${row.address} ${row.address_detail}`}>
                       {row.address}
                     </Typography>
                     <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.phone || "-"}
                      </Typography>
                   </TableCell>
        
                    <TableCell align="center">{getStatusChip(row.status)}</TableCell>
                   
                   <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                     {dayjs(row.created_at).format("YYYY-MM-DD")}
                   </TableCell>
                   <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      {row.updated_at ? dayjs(row.updated_at).format("YYYY-MM-DD") : "-"}
                   </TableCell>
                   
                   <TableCell align="center">
                     <Button 
                       variant="outlined" 
                       size="small" 
                       onClick={() => navigate(`/admin/orders/edit/${row.order_id}`)} 
                       sx={{ borderRadius: '20px', whiteSpace: 'nowrap' }}
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
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminOrderManagement;
