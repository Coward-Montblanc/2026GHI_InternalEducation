import * as eventModel from "../models/event.model.js";
import response from "../utils/response.js";

// イベント一覧取得
export const getEvents = async (req, res) => {
  try {
    const events = await eventModel.getEvents();
    res.json({ success: true, events });
  } catch (err) {
    console.error("イベント一覧取得エラー:", err);
    return response.error(res, "イベントの取得に失敗しました。", 500);
  }
};

// イベント詳細取得
export const getEventDetail = async (req, res) => {
  try {
    const event = await eventModel.getEventDetail(req.params.id);
    if (!event) return response.error(res, "イベントが見つかりません。", 404);
    res.json({ success: true, event });
  } catch (err) {
    console.error("イベント詳細取得エラー:", err);
    return response.error(res, "イベントの取得に失敗しました。", 500);
  }
};

// イベント作成
export const createEvent = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ投稿できます。", 403);
    }
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return response.error(res, "タイトルと本文は必須です。", 400);
    }
    const event_id = await eventModel.createEvent(req.user?.login_id || null, title.trim(), content.trim(), is_pinned ? 1 : 0); //공개 비공개 확인
    return response.success(res, { event_id }, "イベントを登録しました。", 201);
  } catch (err) {
    console.error("イベント登録エラー:", err);
    return response.error(res, "イベントの登録に失敗しました。", 500);
  }
};

// イベント更新
export const updateEvent = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ編集できます。", 403);
    }
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return response.error(res, "タイトルと本文は必須です。", 400);
    }
    const affected = await eventModel.updateEvent(req.params.id, title.trim(), content.trim(), is_pinned ? 1 : 0); //공개 비공개 확인
    if (affected === 0) return response.error(res, "イベントが見つかりません。", 404);
    return response.success(res, {}, "イベントを更新しました。");
  } catch (err) {
    console.error("イベント更新エラー:", err);
    return response.error(res, "イベントの更新に失敗しました。", 500);
  }
};

// イベント論理削除
export const deleteEvent = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ削除できます。", 403);
    }
    const affected = await eventModel.deleteEvent(req.params.id);
    if (affected === 0) return response.error(res, "イベントが見つかりません。", 404);
    return response.success(res, {}, "イベントを削除しました。");
  } catch (err) {
    console.error("イベント削除エラー:", err);
    return response.error(res, "イベントの削除に失敗しました。", 500);
  }
};
