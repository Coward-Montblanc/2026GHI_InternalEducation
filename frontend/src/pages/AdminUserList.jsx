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
import { getAdminUsers } from "../services/UserService";

const ITEMS_PER_PAGE = 10;

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchType, setSearchType] = useState("name"); // 기본값 상품명
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    login_id: "",
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    address: "",
    status: "",
    role: "",
    startDate: null,
    endDate: null,
    searchTerm: ""
  });

  const fetchAdminUsers = useCallback(() => {
      setLoading(true);
      
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: filters.status || undefined,
        role: filters.role || undefined,
        [searchType]: filters.searchTerm || undefined,
        startDate: filters.startDate ? filters.startDate.format("YYYY-MM-DD") : undefined,
        endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : undefined,
      };
  
      getAdminUsers(params)
        .then((data) => {
          setUsers(data.users ?? []);
          setTotalPages(data.pagination?.totalPages ?? 1);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [page, filters, searchType]);

  useEffect(() => {
    fetchAdminUsers();
  }, [page]); // 페이지 변경 시에만 자동 호출, 검색은 버튼 클릭 시 호출 권장

  const handleSearch = () => {
    setPage(1); // 검색 시 첫 페이지로 이동
    fetchAdminUsers();
  };
  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー一覧</Typography>
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
                  <MenuItem value="name">会員名</MenuItem>
                  <MenuItem value="login_id">会員ID</MenuItem>
                  <MenuItem value="email">メール</MenuItem>
                  <MenuItem value="phone">電話番号</MenuItem>
                  <MenuItem value="zip_code">郵便番号</MenuItem>
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

            {/* 회원 상태 */}
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
                  <MenuItem value="0">活動中</MenuItem>
                  <MenuItem value="1">脱退会員</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 회원 등급 */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>ランク</InputLabel>
                <Select
                  sx={{ width: '100px' }}
                  value={filters.role}
                  label="ランク"
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <MenuItem value="">すべて</MenuItem>
                  <MenuItem value="USER">一般会員</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
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

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>ログインID</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>名前</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>メール</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>電話番号</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>郵便番号</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>状態</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>会員等級</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>登録日</TableCell>
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
                    {/* 로그인 ID */}
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
