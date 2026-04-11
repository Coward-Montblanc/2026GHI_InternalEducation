import { Box, Typography, Button, Paper, Divider, Stack, Container } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ListIcon from "@mui/icons-material/List";

const url = import.meta.env.VITE_API_URL;

function NEDetailView({ item, basePath, id, isAdmin, onDelete, onNavigate }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageUrl = (path) => `${url}/uploads/${path}`;

  return (
    <Container maxWidth="false" sx={{ maxWidth: "1000px", mt: 5 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          {item.title}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, color: "text.secondary" }}>
          <Typography variant="body2">作成者： {item.author_name || item.login_id}</Typography>
          <Typography variant="body2">登録日： {formatDate(item.created_at)}</Typography>
          {item.is_pinned === 1 && (
            <Typography variant="caption" sx={{ color: 'error.main', border: '1px solid', borderColor: 'error.main', px: 1, borderRadius: 1 }}>
              PINNED
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {item.thumbnail_path && (
          <Box sx={{ width: "100%", textAlign: "center", mb: 4 }}>
            <img
              src={getImageUrl(item.thumbnail_path)}
              alt="Main Image"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "500px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        )}

        <Paper elevation={0} sx={{ minHeight: 400, mb: 5 }}>
        <Typography
          component="div"
          variant="body1"
          className="editor-content-view"
          sx={{
            lineHeight: 1.8,
            fontSize: "1.1rem",
            color: "#333",
            "& img": { 
              maxWidth: "100% !important", 
              height: "auto !important", 
              display: "inline-block", 
              my: 2 
            },
            "& img": { maxWidth: "100%", height: "auto", display: "block", my: 2 },
            "& h1, & h2, & h3, & h4, & h5": { my: 2, fontWeight: "bold" },
            "& ul, & ol": { ml: 3, my: 2 },
            "& blockquote": { borderLeft: "4px solid #ddd", pl: 2, color: "text.secondary", my: 2 },
            overflowWrap: "break-word",
            wordBreak: "break-all"
          }}
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </Paper>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ListIcon />}
            onClick={() => onNavigate(basePath)}
          >
            戻る
          </Button>

          {isAdmin && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => onNavigate(`${basePath}/edit/${id}`)}
              >
                修正
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
              >
                削除
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default NEDetailView;