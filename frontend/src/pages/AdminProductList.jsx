import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Stack, Grid, Pagination ,Switch
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getAdminProducts ,updateRecommendStatus } from "../services/ProductService";
import { LoadingView } from "../components/LoadingCircle";

const ITEMS_PER_PAGE = 10;

const formatPrice = (price) => new Intl.NumberFormat("ja-JP").format(price) + "円";

function AdminProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchType, setSearchType] = useState("name"); // 기본값 상품명
  const [filters, setFilters] = useState({
    product_id: "",
    name: "",
    category_id: "",
    status: "",
    startDate: null,
    endDate: null,
    searchTerm: ""
  });

  const fetchAdminProducts = useCallback(() => {
    setLoading(true);
    
    const params = {
      page,
      limit: ITEMS_PER_PAGE,
      status: filters.status || undefined,
      category_id: filters.category_id || undefined,
      [searchType]: filters.searchTerm || undefined,
      startDate: filters.startDate ? filters.startDate.format("YYYY-MM-DD") : undefined,
      endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : undefined,
    };

    getAdminProducts(params)
      .then((data) => {
        setProducts(data.products ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, filters, searchType]);

  //추천 상태 스위치 클릭 함수
  const handleToggleRecommend = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await updateRecommendStatus(productId, newStatus);

      setProducts(prev => prev.map(p => 
        p.product_id === productId ? { ...p, is_recommended: newStatus } : p
      ));
    } catch (err) {
      alert("おすすめ状態の更新に失敗しました。");
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, [page, fetchAdminProducts]);

  const handleSearch = () => {
    setPage(1); // 검색 시 첫 페이지로 이동
    fetchAdminProducts();
  };

  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>商品管理</Typography>
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
                  <MenuItem value="name">商品名</MenuItem>
                  <MenuItem value="product_id">商品ID</MenuItem>
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

            {/* 상품 상태 : 판매중, 판매중지, 품절 */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>状態</InputLabel>
                <Select
                  sx={{ width: '100px' }}
                  value={filters.status}
                  label="状態"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">すべて</MenuItem>
                  <MenuItem value="0">販売中</MenuItem>
                  <MenuItem value="1">販売停止</MenuItem>
                  <MenuItem value="2">品切れ</MenuItem>
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
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>商品ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>商品名</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>カテゴリー</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>価格</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>在庫</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>閲覧数</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>販売数</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>おすすめ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>登録日時</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>状態</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", py: 4 }}>
                        商品データがありません。
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.product_id} hover>
                        <TableCell align="center">{p.product_id}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </TableCell>
                        <TableCell align="center">{p.category_name?? "-"}</TableCell>
                        <TableCell align="center">{formatPrice(p.price)}</TableCell>
                        <TableCell align="center">{p.stock}個</TableCell>
                        <TableCell align="center">{p.view?.toLocaleString() || 0}</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {p.sales_count || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Switch 
                            size="small"
                            checked={p.is_recommended === 1}
                            onChange={() => handleToggleRecommend(p.product_id, p.is_recommended)}
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell align="center">{dayjs(p.created_at).format("YYYY-MM-DD")}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 0 ? "販売中" : p.status === 2 ? "品切れ" : "販売停止"}
                            size="small"
                            color={p.status === 0 ? "success" : p.status === 2 ? "warning" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/admin/product-edit/${p.product_id}`)}
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
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                />
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button variant="contained" onClick={() => navigate("/admin/product-add")}>
                商品登録
              </Button>
            </Box>
          </>
        )}
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

export default AdminProductList;
