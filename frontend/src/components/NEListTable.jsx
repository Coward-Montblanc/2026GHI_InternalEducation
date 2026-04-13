import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { formatDate } from "../utils/date";
import { LoadingView } from "../components/LoadingCircle";
function NEListTable({
  items = [],
  idKey,
  basePath,
  error,
  loading,
  onNavigate,
}) {

  return (
    <Box sx={{ width: "100%", margin: "0 auto" }}>
      {error && ( <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> )}
      {loading ? ( <LoadingView />
      ) : (
        <Box sx={{ borderTop: "2px solid #333" }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            py: 1.5, 
            px: 2, 
            bgcolor: "#fcfcfc", 
            borderBottom: "1px solid #eee",
            color: "text.secondary"
          }}>
            <Typography variant="caption" sx={{ width: "80px", textAlign: "center", fontWeight: "bold" }}>No.</Typography>
            <Typography variant="caption" sx={{ flexGrow: 1, fontWeight: "bold", px: 2 }}>タイトル</Typography>
            <Typography variant="caption" sx={{ width: "150px", textAlign: "center", fontWeight: "bold" }}>作成日</Typography>
            <Typography variant="caption" sx={{ width: "100px", textAlign: "center", fontWeight: "bold" }}>作成者</Typography>
          </Box>

          {items.map((item) => (
            <Box
              key={item[idKey]}
              onClick={() => onNavigate(`${basePath}/${item[idKey]}`)}
              sx={{
                display: "flex",
                alignItems: "center",
                py: 1.8,
                px: 2,
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
                bgcolor: item.is_pinned ? "#fff9f9" : "white",
                transition: "background-color 0.1s",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                },
              }}
            >
              <Box sx={{ width: "80px", textAlign: "center", flexShrink: 0 }}>
                {item.is_pinned ? (
                  <PushPinIcon sx={{ fontSize: 16, color: "error.main" }} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {item[idKey].replace(/^(NT|EV)/, "")}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  flexGrow: 1,
                  fontWeight: item.is_pinned ? "bold" : 400,
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  px: 2,
                  fontSize: "0.95rem"
                }}
              >
                {item.title}
              </Typography>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ width: "150px", textAlign: "center", flexShrink: 0 }}
              >
                {formatDate(item.created_at)}
              </Typography>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ width: "100px", textAlign: "center", flexShrink: 0 }}
              >
                {item.author_name || "Admin"}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default NEListTable;