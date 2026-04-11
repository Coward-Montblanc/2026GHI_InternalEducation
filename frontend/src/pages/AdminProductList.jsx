import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Stack, Grid, Pagination ,Switch, TableSortLabel, Collapse, Checkbox
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ExpandMore, ExpandLess, Search, RestartAlt } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getAdminProducts ,updateRecommendStatus, bulkUpdateProductStatus } from "../services/ProductService";
import { LoadingView } from "../components/LoadingCircle";
import api from "../api/axios";

const ITEMS_PER_PAGE = 10; //1ページ内に表示する商品の数

const formatPrice = (price) => new Intl.NumberFormat("ja-JP").format(price) + "円";

const fetchCommonCodes = async (groupCode) => {
  const response = await api.get(`/common/codes/${groupCode}`); 
  return response.data;
};

const initialFilters = { //初期化用
    product_id: "",
    name: "",
    category_id: "",
    status: "all",
    startDate: null,
    endDate: null,
    searchTerm: "",
    is_recommended: "all",
    minPrice: "", maxPrice: "",
    minStock: "", maxStock: "",
    minView: "", maxView: "",
    minSales: "", maxSales: "",
    minView: "", maxView: "",
    minSales: "", maxSales: "",
    
  };

function AdminProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [order, setOrder] = useState("desc"); 
  const [orderBy, setOrderBy] = useState("created_at"); 
  const [bulkStatus, setBulkStatus] = useState("");

  const [searchType, setSearchType] = useState(""); 
  const [showDetail, setShowDetail] = useState(false);
  const [productStatusList, setProductStatusList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    product_id: "",
    name: "",
    category_id: "",
    status: "all",
    startDate: null,
    endDate: null,
    searchTerm: "",
    is_recommended: "all",
    minPrice: "", maxPrice: "",
    minStock: "", maxStock: "",
    minView: "", maxView: "",
    minSales: "", maxSales: "",
  });

  const handleSelectAll = (e) => {
  if (e.target.checked) {
      setSelectedIds(products.map((p) => p.product_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [searchQuery, setSearchQuery] = useState(filters);

  useEffect(() => {
    fetchCommonCodes("PRODUCT_STATUS_CODE")
      .then((data) => {
        if (data && Array.isArray(data.codes)) {
        setProductStatusList(data.codes);
        }else { setSearchType("name"); }
      })
      .catch((err) => {
      console.error("コードの読み込みに失敗しました。", err);
      setSearchType("name");
    });
  }, []);

  const fetchAdminProducts = useCallback(() => {
    setLoading(true);
    
    const params = {
      page,
      limit: ITEMS_PER_PAGE,
      status: searchQuery.status === "all" ? undefined : searchQuery.status,
      category_id: searchQuery.category_id || undefined,
      is_recommended: searchQuery.is_recommended === "all" ? undefined : searchQuery.is_recommended,
      name: searchQuery.name || (searchType === 'name' ? searchQuery.searchTerm : undefined),
      product_id: searchQuery.product_id || (searchType === 'product_id' ? searchQuery.searchTerm : undefined),
      startDate: searchQuery.startDate ? searchQuery.startDate.format("YYYY-MM-DD") : undefined,
      endDate: searchQuery.endDate ? searchQuery.endDate.format("YYYY-MM-DD") : undefined,
      minPrice: searchQuery.minPrice || undefined,
      maxPrice: searchQuery.maxPrice || undefined,
      minStock: searchQuery.minStock || undefined,
      maxStock: searchQuery.maxStock || undefined,
      minView: searchQuery.minView || undefined,
      maxView: searchQuery.maxView || undefined,
      minSales: searchQuery.minSales || undefined,
      maxSales: searchQuery.maxSales || undefined,
      sortField: orderBy,
      sortOrder: order.toUpperCase(),
    };

    const addFilter = (key, value) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params[key] = value;
      }
    };

    addFilter("status", searchQuery.status);
    addFilter("category_id", searchQuery.category_id);
    addFilter("is_recommended", searchQuery.is_recommended);
  
    if (searchQuery.startDate) params.startDate = searchQuery.startDate.format("YYYY-MM-DD");
    if (searchQuery.endDate) params.endDate = searchQuery.endDate.format("YYYY-MM-DD");

    addFilter("name", searchQuery.name);
    addFilter("product_id", searchQuery.product_id);

    if (searchQuery.searchTerm && !params[searchType]) {
      params[searchType] = searchQuery.searchTerm;
    }

    addFilter("minPrice", searchQuery.minPrice);
    addFilter("maxPrice", searchQuery.maxPrice);

    getAdminProducts(params)
      .then((data) => {
        setProducts(data.products ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, searchQuery, order, orderBy]);

  //推奨ステータススイッチクリック機能
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

  //整列状態を変更する関数
  const handleRequestSort = (property) => { 
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setSearchQuery(initialFilters);
    setPage(1);
  };

  const handleSearch = () => {
  setPage(1); 
  setSearchQuery({
    ...filters,
    searchType: searchType
    });
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0 || bulkStatus === "") return;

    const statusText = bulkStatus === 0 ? "販売中" : bulkStatus === 1 ? "販売停止" : "品切れ";
    if (!window.confirm(`${selectedIds.length}個の商品を「${statusText}」に変更しますか？`)) return;

    try {
      setLoading(true);
      await bulkUpdateProductStatus(selectedIds, bulkStatus);
    
      alert("正常に更新されました。");
    
      setSelectedIds([]);
      setBulkStatus("");
      fetchAdminProducts(); 
    } catch (err) {
      alert("更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, [fetchAdminProducts]);

  if (loading) { return ( <LoadingView /> ); }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>商品管理</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "#fcfcfc" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* 簡易検索エリア */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={1.5}>
              <TextField
                size="small"
                label="商品ID"
                value={filters.product_id}
                onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>

            {/* 商品名入力欄 */}
            <Grid item xs={12} md={1.5}>
              <TextField
                size="small"
                label="商品名"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField 
                fullWidth 
                size="small" 
                label="カテゴリー" 
                value={filters.category_id || ""} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({...filters, category_id: val});
                }}
                onFocus={(e) => { if(e.target.value === "") setFilters({...filters, category_id: ""}) }}
              />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl 
                fullWidth 
                size="small" 
                >
                <InputLabel>おすすめ</InputLabel>
                <Select value={filters.is_recommended} label="おすすめ"
                  onChange={(e) => setFilters({...filters, is_recommended: e.target.value})}>
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="1">おすすめ(ON)</MenuItem>
                  <MenuItem value="0">おすすめ(OFF)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="キーワード入力"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="検索語を入力してください。"
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" startIcon={<Search />} onClick={handleSearch} >検索</Button>
                <Button variant="outlined" color="inherit" onClick={() => setShowDetail(!showDetail)}>
                  {showDetail ? <ExpandLess /> : <ExpandMore />}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* 詳細検索エリア(Collapse) */}
          <Collapse in={showDetail}>
            <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #ddd" }}>
              <Grid container spacing={2}>
                {/* 価格範囲 */}
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>価格範囲 (円)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField size="small" placeholder="最小" value={filters.minPrice} onChange={(e)=>setFilters({...filters, minPrice: e.target.value})}/>
                    <Typography>~</Typography>
                    <TextField size="small" placeholder="最大" value={filters.maxPrice} onChange={(e)=>setFilters({...filters, maxPrice: e.target.value})}/>
                  </Stack>
                </Grid>
                {/* 在庫範囲 */}
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>在庫数</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField size="small" placeholder="最小" value={filters.minStock} onChange={(e)=>setFilters({...filters, minStock: e.target.value})}/>
                    <Typography>~</Typography>
                    <TextField size="small" placeholder="最大" value={filters.maxStock} onChange={(e)=>setFilters({...filters, maxStock: e.target.value})}/>
                  </Stack>
                </Grid>
                {/* 販売状況 */}
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', width : "110px" }}>販売状態</Typography>
                  <FormControl fullWidth size="small">
                    <Select 
                    displayEmpty
                    notched
                    value={filters.status} 
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                      <MenuItem value="all">すべて</MenuItem>
                      <MenuItem value="0">販売中</MenuItem>
                      <MenuItem value="1">販売停止</MenuItem>
                      <MenuItem value="2">品切れ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>閲覧数 (View)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="最小"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.minView}
                      onChange={(e) => setFilters({ ...filters, minView: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  <Typography>~</Typography>
                    <TextField
                      label="最大"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.maxView}
                      onChange={(e) => setFilters({ ...filters, maxView: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>販売数 (Sales)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="最小"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.minSales}
                      onChange={(e) => setFilters({ ...filters, minSales: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  <Typography>~</Typography>
                    <TextField
                      label="最大"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.maxSales}
                      onChange={(e) => setFilters({ ...filters, maxSales: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </Stack>
                </Grid>
                {/* 登録日の範囲 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>登録日</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DatePicker 
                      slotProps={{ textField: { size: 'small' } }} 
                      value={filters.startDate} 
                      onChange={(v) => setFilters({ ...filters, startDate: v })} 
                    />
                  <Typography>~</Typography>
                    <DatePicker 
                      slotProps={{ textField: { size: 'small' } }} 
                      value={filters.endDate} 
                      onChange={(v) => setFilters({ ...filters, endDate: v })} 
                    />
                  </Stack>
                </Grid>
              </Grid>
              <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2 }} >
                <Button 
                  variant="contained" 
                  color="error" 
                  size="large"
                  startIcon={<RestartAlt />} 
                  onClick={handleReset}
                  sx={{ 
                    minWidth: '130px', 
                    height: '50px', 
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)', 
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                      boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
                    }
                  }}
                >
                  リセット
                </Button>
              </Box>
              </Grid>
            </Box>
          </Collapse>
        </LocalizationProvider>
      </Paper>
      {selectedIds.length > 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, mb: 2, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 2 
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {selectedIds.length}個の商品が選択されました
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
              <InputLabel>状態変更</InputLabel>
              <Select
                label="状態変更"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                {productStatusList.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
      
            <Button 
              variant="contained" 
              onClick={handleBulkUpdate}
              disabled={bulkStatus === ""}
            >
              一括更新
            </Button>
          </Stack>
          
          <Button size="small" onClick={() => setSelectedIds([])}>選択解除</Button>
        </Paper>
      )}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5", "& th": { whiteSpace: "nowrap" } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < products.length}
                        checked={products.length > 0 && selectedIds.length === products.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700,  }}>
                      <TableSortLabel
                        active={orderBy === "product_id"}
                        direction={orderBy === "product_id" ? order : "asc"}
                        onClick={() => handleRequestSort("product_id")}
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
                        商品ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>商品名</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>カテゴリー</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      <TableSortLabel
                        active={orderBy === "price"}
                        direction={orderBy === "price" ? order : "asc"}
                        onClick={() => handleRequestSort("price")}
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
                        価格
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      <TableSortLabel
                        active={orderBy === "stock"}
                        direction={orderBy === "stock" ? order : "asc"}
                        onClick={() => handleRequestSort("stock")}
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
                        在庫
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      <TableSortLabel
                        active={orderBy === "view"}
                        direction={orderBy === "view" ? order : "asc"}
                        onClick={() => handleRequestSort("view")}
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
                        閲覧数
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      <TableSortLabel
                        active={orderBy === "sales_count"}
                        direction={orderBy === "sales_count" ? order : "asc"}
                        onClick={() => handleRequestSort("sales_count")}
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
                        販売数
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>おすすめ</TableCell>
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
                        登録日時
                      </TableSortLabel>
                    </TableCell>
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
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.includes(p.product_id)}
                            onChange={() => handleSelectOne(p.product_id)}
                          />
                        </TableCell>
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
      </Paper>
    </Box>
  );
}

export default AdminProductList;
