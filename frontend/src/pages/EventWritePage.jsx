import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { createEvent } from "../services/EventService";
import { LoadingView } from "../components/LoadingCircle";

function EventWritePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [is_pinned, setIsPinned] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/event", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文を入力してください。");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createEvent({ title: title.trim(), content: content.trim(), is_pinned: is_pinned ? 1 : 0 });
      navigate("/event");
    } catch (err) {
      setError(err.response?.data?.message || "登録に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (!isAdmin) return null;

  return (
    <>
      <Box sx={{ minHeight: "60vh", p: 4, maxWidth: 700, margin: "0 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          イベント 新規投稿
        </Typography>
        <Paper elevation={1} sx={{ p: 4, minHeight: 500 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="本文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              multiline
              rows={16}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={is_pinned} onChange={(e) => setIsPinned(e.target.checked)} />}
              label="トップに固定する"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "送信中..." : "投稿する"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate("/event")}>
                キャンセル
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      <Footer />
    </>
  );
}

export default EventWritePage;
