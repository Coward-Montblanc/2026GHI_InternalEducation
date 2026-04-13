import db from "../config/db.js";
import * as noticeModel from "../models/notice.model.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES } from "../config/constants.js";

// お知らせ一覧取得
export const getNotices = async (req, res) => {
  try {
    const notices = await noticeModel.getNotices();
    return response.success(res, { notices },RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    console.error("お知らせ一覧取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

// お知らせ詳細取得
export const getNoticeDetail = async (req, res) => {
  try {
    const notice = await noticeModel.getNoticeDetail(req.params.id);
    if (!notice) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    res.json({ success: true, notice });
  } catch (err) {
    console.error("お知らせ詳細取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

// お知らせ作成
export const createNotice = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    if (req.user?.role !== "ADMIN") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
    }

    const notice_id = await noticeModel.createNotice( 
      req.user?.login_id || null, 
      req.body, 
      req.files || {}, 
      connection 
    );

    await connection.commit();
    return response.success(res, { notice_id }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("お知らせ登録エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }finally {
    if (connection) connection.release();
  }
};

// お知らせ更新
export const updateNotice = async (req, res) => {
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    if (req.user?.role !== "ADMIN") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }

    const noticeId = req.params.id;
    const { 
      title, content, is_pinned, is_banner, 
      banner_priority, banner_link_url, banner_start_at, banner_end_at
    } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
    }

    const pinnedValue = Number(is_pinned) === 1 ? 1 : 0;
    const bannerValue = Number(is_banner) === 1 ? 1 : 0;

    const thumbnailPath = req.files?.['thumbnail'] ? req.files['thumbnail'][0].filename : null;
    const bannerPath = req.files?.['banner_image'] ? req.files['banner_image'][0].filename : null;

    const affected = await noticeModel.updateNotice(
      noticeId, 
      {
        title: title.trim(),
        content: content.trim(),
        is_pinned: pinnedValue,
        is_banner: bannerValue,
        banner_priority: banner_priority || 1,
        banner_link_url: banner_link_url || null,
        banner_start_at: banner_start_at || null,
        banner_end_at: banner_end_at || null,
        thumbnail_path: thumbnailPath,
        banner_path: bannerPath
      },
      connection
    );

    if (affected === 0){ 
      await connection.rollback(); 
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }

    await connection.commit();
    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("お知らせ更新エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }finally {
    if (connection) connection.release();
  }
};

// お知らせ論理削除
export const deleteNotice = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }
    const affected = await noticeModel.deleteNotice(req.params.id);
    if (affected === 0) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    console.error("お知らせ削除エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};
