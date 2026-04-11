import db from "../config/db.js";
import * as eventModel from "../models/event.model.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES } from "../config/constants.js";

// イベント一覧取得
export const getEvents = async (req, res) => {
  try {
    const events = await eventModel.getEvents();
    res.json({ success: true, events });
  } catch (err) {
    console.error("イベント一覧取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.EVENT_FETCH_FAILED);
  }
};

// イベント詳細取得
export const getEventDetail = async (req, res) => {
  try {
    const event = await eventModel.getEventDetail(req.params.id);
    if (!event) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.EVENT_NOT_FOUND);
    return response.success(res, { success: true, event }, 201);
  } catch (err) {
    console.error("イベント詳細取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.EVENT_FETCH_FAILED);
  }
};

// イベント作成
export const createEvent = async (req, res) => {
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

    const event_id = await eventModel.createEvent( 
      req.user?.login_id || null, 
      req.body, 
      req.files || {}, 
      connection 
    );
    
    
    await connection.commit();
    return response.success(res, { event_id }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("お知らせ登録エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }finally {
    if (connection) connection.release();
  }
};

// イベント更新
export const updateEvent = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    if (req.user?.role !== "ADMIN") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }

    const eventId = req.params.id;
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

    const affected = await eventModel.updateEvent(
      eventId, 
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

// イベント論理削除
export const deleteEvent = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_PERMISSION);
    }
    const affected = await eventModel.deleteEvent(req.params.id);
    if (affected === 0) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    return response.success(res, {}, "イベントを削除しました。");
  } catch (err) {
    console.error("イベント削除エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

//バナー用コントローラ
export const getBannerList = async (req, res) => {
    try {
        const query = `
            SELECT 
                event_id, title, banner_path, banner_link_url, banner_priority, created_at,
                'event' as type
            FROM events
            WHERE is_banner = 1 
            AND status = 0
            AND (banner_start_at IS NULL OR banner_start_at <= NOW())
            AND (banner_end_at IS NULL OR banner_end_at >= NOW())
            UNION ALL
            SELECT 
                notice_id, title, banner_path, banner_link_url, banner_priority, created_at,
                'notice' as type
            FROM notices
            WHERE is_banner = 1 
            AND status = 0
            AND (banner_start_at IS NULL OR banner_start_at <= NOW())
            AND (banner_end_at IS NULL OR banner_end_at >= NOW())

            ORDER BY banner_priority DESC, type ASC, created_at DESC
        `;
        const [rows] = await db.execute(query);
        
        return response.success(res, {banners: rows }, "イベントを削除しました。");
    } catch (error) {
        console.error("バナー検索エラー：", error);
        return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
    }
};