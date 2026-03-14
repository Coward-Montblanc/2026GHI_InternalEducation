import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Pagination, Chip, Button,
} from "@mui/material";
import { getAdminProducts } from "../services/ProductService";

const ITEMS_PER_PAGE = 10;

const formatPrice = (price) => new Intl.NumberFormat("ja-JP").format(price) + "円";

function AdminProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAdminProducts(page, ITEMS_PER_PAGE, "")
      .then((data) => {
        setProducts(data.products ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>商品管理</Typography>
      </Box>
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}
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
                    <TableCell align="center" sx={{ fontWeight: 700 }}>ステータス</TableCell>
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
                        <TableCell align="center">{p.category_name ?? "-"}</TableCell>
                        <TableCell align="center">{formatPrice(p.price)}</TableCell>
                        <TableCell align="center">{p.stock}個</TableCell>
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
