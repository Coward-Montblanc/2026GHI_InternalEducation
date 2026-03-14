import {
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";

const SAMPLE_ROWS = [
  { user_id: "US1", name: "山田 太郎",  login_id: "yamada01",    email: "yamada@example.com",    phone: "090-1234-5678", created_at: "2024-01-15" }
];

function AdminUserList() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>ユーザー一覧</Typography>
      </Box>
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, bgcolor: "#fff" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>ログインID</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>名前</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>メール</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>電話番号</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>登録日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SAMPLE_ROWS.map((row) => (
                <TableRow key={row.login_id} hover>
                  <TableCell align="center">{row.login_id}</TableCell>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">{row.email}</TableCell>
                  <TableCell align="center">{row.phone}</TableCell>
                  <TableCell align="center">{row.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default AdminUserList;
