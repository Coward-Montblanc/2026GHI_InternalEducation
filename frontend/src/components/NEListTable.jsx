import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import { formatDate } from "../utils/date";

function NEListTable({
  title,
  emptyMessage,
  items = [],
  idKey,
  basePath,
  error,
  loading,
  isAdmin,
  onNavigate,
}) {
  return (
    <Box sx={{ minHeight: "60vh", p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 3 }}>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { py: 1.5 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>No.</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "50%" }}>タイトル</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "20%" }}>作成日</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>作成者</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item[idKey]}
                  hover
                  sx={{
                    cursor: "pointer",
                    bgcolor: item.is_pinned ? "grey.50" : "white",
                  }}
                  onClick={() => onNavigate(`${basePath}/${item[idKey]}`)}
                >
                  <TableCell sx={{ width: "15%", fontWeight: item.is_pinned ? "bold" : "normal" }}>
                    {item[idKey]}
                  </TableCell>
                  <TableCell sx={{ width: "50%", fontWeight: item.is_pinned ? "bold" : "normal" }}>
                    {item.title}
                  </TableCell>
                  <TableCell sx={{ width: "20%", fontWeight: item.is_pinned ? "bold" : "normal" }}>
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell sx={{ width: "15%", fontWeight: item.is_pinned ? "bold" : "normal" }}>
                    {item.author_name || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={() => onNavigate(`${basePath}/write`)}>
            新規投稿
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default NEListTable;
