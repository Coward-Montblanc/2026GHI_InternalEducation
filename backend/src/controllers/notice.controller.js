import * as noticeModel from "../models/notice.model.js";
import response from "../utils/response.js";

// お知らせ一覧取得
export const getNotices = async (req, res) => {
  try {
    const notices = await noticeModel.getNotices();
    res.json({ success: true, notices });
  } catch (err) {
    console.error("お知らせ一覧取得エラー:", err);
    return response.error(res, "お知らせの取得に失敗しました。", 500);
  }
};

// お知らせ詳細取得
export const getNoticeDetail = async (req, res) => {
  try {
    const notice = await noticeModel.getNoticeDetail(req.params.id);
    if (!notice) return response.error(res, "お知らせが見つかりません。", 404);
    res.json({ success: true, notice });
  } catch (err) {
    console.error("お知らせ詳細取得エラー:", err);
    return response.error(res, "お知らせの取得に失敗しました。", 500);
  }
};

// お知らせ作成
export const createNotice = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ投稿できます。", 403);
    }
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return response.error(res, "タイトルと本文は必須です。", 400);
    }
    const notice_id = await noticeModel.createNotice(req.user?.login_id || null, title.trim(), content.trim(), is_pinned ? 1 : 0); //공개 비공개 확인
    return response.success(res, { notice_id }, "お知らせを登録しました。", 201);
  } catch (err) {
    console.error("お知らせ登録エラー:", err);
    return response.error(res, "お知らせの登録に失敗しました。", 500);
  }
};

// お知らせ更新
export const updateNotice = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ編集できます。", 403);
    }
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return response.error(res, "タイトルと本文は必須です。", 400);
    }
    const affected = await noticeModel.updateNotice(req.params.id, title.trim(), content.trim(), is_pinned ? 1 : 0); //공개 비공개 확인
    if (affected === 0) return response.error(res, "お知らせが見つかりません。", 404);
    return response.success(res, {}, "お知らせを更新しました。");
  } catch (err) {
    console.error("お知らせ更新エラー:", err);
    return response.error(res, "お知らせの更新に失敗しました。", 500);
  }
};

// お知らせ論理削除
export const deleteNotice = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, "管理者のみ削除できます。", 403);
    }
    const affected = await noticeModel.deleteNotice(req.params.id);
    if (affected === 0) return response.error(res, "お知らせが見つかりません。", 404);
    return response.success(res, {}, "お知らせを削除しました。");
  } catch (err) {
    console.error("お知らせ削除エラー:", err);
    return response.error(res, "お知らせの削除に失敗しました。", 500);
  }
};
