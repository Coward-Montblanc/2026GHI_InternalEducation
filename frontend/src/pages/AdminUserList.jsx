import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Stack, Grid, Pagination, TableSortLabel, Collapse
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ExpandMore, ExpandLess, RestartAlt, Search } from '@mui/icons-material';
import { LoadingView } from "../components/LoadingCircle";
import { getAdminUsers } from "../services/UserService";

const ITEMS_PER_PAGE = 10;

const initialFilters = { //初期化用
    login_id: "",
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    address: "",
    status: "all",
    role: "all",
    startDate: null,
    endDate: null,
    searchTerm: ""
  };

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("desc"); 
  const [orderBy, setOrderBy] = useState("created_at"); 
  const [searchType, setSearchType] = useState("name");
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialFilters);
  const [filters, setFilters] = useState({
    login_id: "",
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    address: "",
    status: "all",
    role: "all",
    startDate: null,
    endDate: null,
    searchTerm: ""
  });

  const fetchAdminUsers = useCallback(() => {
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

    addFilter("name", searchQuery.name);
    addFilter("login_id", searchQuery.login_id);
    addFilter("email", searchQuery.email);
    addFilter("phone", searchQuery.phone);
    addFilter("zip_code", searchQuery.zip_code);
    addFilter("status", searchQuery.status);
    addFilter("role", searchQuery.role);

    if (searchQuery.searchTerm && !params[searchType]) {
      params[searchType] = searchQuery.searchTerm;
    }

    if (searchQuery.startDate) params.startDate = searchQuery.startDate.format("YYYY-MM-DD");
    if (searchQuery.endDate) params.endDate = searchQuery.endDate.format("YYYY-MM-DD");


    getAdminUsers(params)
      .then((data) => {
        setUsers(data.users ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, searchQuery, order, orderBy]);

  const handleReset = () => { //리셋버튼
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

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery({ 
      ...filters 
    });
  };
  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー一覧</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff" }}>
        {/* 基本フィールド */}
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={2}>
            <Typography 
              variant="caption" 
              sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>会員ID</Typography>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="ID" 
              value={filters.login_id} 
              onChange={(e)=>setFilters({...filters, login_id: e.target.value})}/>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <Typography 
              variant="caption" 
              sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>名前</Typography>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="名前" 
              value={filters.name} onChange={(e)=>setFilters({...filters, name: e.target.value})}/>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>状態</Typography>
            <FormControl 
              fullWidth 
              size="small" 
              sx={{ width: '100px'}} >
              <Select value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="0">活動中</MenuItem>
                <MenuItem value="1">脱退</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography 
              variant="caption" 
              sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>ランク</Typography>
            <FormControl 
              fullWidth 
              size="small" 
              sx={{ width: '100px'}} >
              <Select value={filters.role} onChange={(e)=>setFilters({...filters, role: e.target.value})}>
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="USER">一般会員</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* 検索ボタンと詳細ボタン領域 */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<Search />} 
              onClick={handleSearch} 
              sx={{ height: '40px', fontWeight: 'bold' }}
            >
              検索
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={() => setShowDetail(!showDetail)}
              sx={{ height: '40px', minWidth: '50px' }}
            >
              {showDetail ? <ExpandLess /> : <ExpandMore />}
            </Button>
          </Grid>
        </Grid>

        {/* 展開したときに出てくるフィールド */}
        <Collapse in={showDetail}>
          <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #eee" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>メール</Typography>
                <TextField fullWidth size="small" placeholder="example@mail.com" value={filters.email} onChange={(e)=>setFilters({...filters, email: e.target.value})}/>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>電話番号</Typography>
                <TextField fullWidth size="small" placeholder="010-0000-0000" value={filters.phone} onChange={(e)=>setFilters({...filters, phone: e.target.value})}/>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}>登録期間</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.startDate} onChange={(v)=>setFilters({...filters, startDate: v})} />
                    <Typography sx={{ color: 'text.secondary' }}>~</Typography>
                    <DatePicker slotProps={{ textField: { size: 'small' } }} value={filters.endDate} onChange={(v)=>setFilters({...filters, endDate: v})} />
                  </Stack>
                </LocalizationProvider>
              </Grid>

              {/* リセットボタン */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<RestartAlt />} 
                  onClick={handleReset}
                  sx={{ 
                    minWidth: '130px', 
                    height: '45px', 
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                      boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
                    }
                  }}
                >
                  リセット
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5", "& th": { whiteSpace: "nowrap" } }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === "login_id"}
                    direction={orderBy === "login_id" ? order : "asc"}
                    onClick={() => handleRequestSort("login_id")}
                    hideSortIcon={false}
                    sx={{"& .MuiTableSortLabel-icon": {
                      opacity: 1,
                      display: 'inline-block !important',
                    },
                      "&.Mui-active .MuiTableSortLabel-icon": {
                      color: "primary.main",
                    }
                    }}
                  >
                    ログインID
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                    hideSortIcon={false}
                    sx={{"& .MuiTableSortLabel-icon": {
                      opacity: 1,
                      display: 'inline-block !important',
                    },
                      "&.Mui-active .MuiTableSortLabel-icon": {
                      color: "primary.main",
                    }
                    }}
                  >
                    名前
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>メール</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>電話番号</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>郵便番号</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>状態</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>会員等級</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === "created_at"}
                    direction={orderBy === "created_at" ? order : "asc"}
                    onClick={() => handleRequestSort("created_at")}
                    hideSortIcon={false}
                    sx={{"& .MuiTableSortLabel-icon": {
                      opacity: 1,
                      display: 'inline-block !important',
                    },
                      "&.Mui-active .MuiTableSortLabel-icon": {
                      color: "primary.main",
                    }
                    }}
                  >
                    登録日
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    該当するユーザーが見つかりません。
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.login_id} hover>
                    {/* ログインID */}
                    <TableCell align="center">{u.login_id}</TableCell>
                    <TableCell align="center">{u.name}</TableCell>
                    <TableCell align="center">{u.email}</TableCell>
                    <TableCell align="center">{u.phone || "-"}</TableCell>
                    <TableCell align="center">{u.zip_code || "-"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={u.status === 0 ? "活動中" : "脱退"}
                        size="small"
                        variant="outlined"
                        color={u.status === 0 ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell align="center">
                        <Chip
                          label={u.role === "ADMIN" ? "ADMIN" : "一般会員"}
                          size="small"
                          color={u.role === "ADMIN" ? "primary" : "default"}
                          sx={{ 
                            fontWeight: u.role === "ADMIN" ? 800 : 400,
                            bgcolor: u.role === "ADMIN" ? "" : "#f0f0f0" 
                          }}
                        />
                      </TableCell>
                    <TableCell align="center">
                    {u.created_at ? dayjs(u.created_at).format("YYYY-MM-DD") : "-"}
                    </TableCell>
                  </TableRow>
               ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box 
        sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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

export default AdminUserList;
