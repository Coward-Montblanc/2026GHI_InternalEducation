import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { formatDate } from "../utils/date";

function NEDetailView({ item, basePath, id, isAdmin, onDelete, onNavigate }) {
  return (
    <Box sx={{ minHeight: "80vh", p: 4, maxWidth: 1000, margin: "0 auto" }}>
      <Paper elevation={1} sx={{ p: 4, minHeight: 500 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {item.title}
          </Typography>
          {isAdmin && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => onNavigate(`${basePath}/${id}/edit`)}>
                編集
              </Button>
              <Button variant="outlined" size="small" color="error" onClick={onDelete}>
                削除
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          更新: {formatDate(item.updated_at)}
          {item.author_name && ` · 作成者: ${item.author_name}`}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography component="pre" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
          {item.content}
        </Typography>
      </Paper>
      <Button variant="text" sx={{ mt: 2 }} onClick={() => onNavigate(basePath)}>
        ← 一覧に戻る
      </Button>
    </Box>
  );
}

export default NEDetailView;
