import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress, //조회해야해서 로딩 추가
} from "@mui/material";
import { getEventDetail, updateEvent } from "../services/EventService";

function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [is_pinned, setIsPinned] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin && user !== undefined) {
      navigate("/event", { replace: true });
      return;
    }
  }, [isAdmin, user, navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || !isAdmin) return;
      try {
        setLoading(true);
        const data = await getEventDetail(id);
        const e = data.event;
        if (e) {
          setTitle(e.title);
          setContent(e.content);
          setIsPinned(!!e.is_pinned);
        }
      } catch (err) {
        setError(err.response?.data?.message || "イベントの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin && id) fetchEvent();
  }, [id, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文を入力してください。");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await updateEvent(id, { title: title.trim(), content: content.trim(), is_pinned: is_pinned ? 1 : 0 });
      navigate(`/event/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (!isAdmin) return null;
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: "60vh", p: 4, maxWidth: 700, margin: "0 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          イベント 編集
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
                {submitting ? "更新中..." : "更新する"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate(`/event/${id}`)}>
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

export default EventEditPage;
