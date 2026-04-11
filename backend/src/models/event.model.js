import db from "../config/db.js";

//イベントリスト（論理削除を除く）
export const getEvents = async () => {
  const [rows] = await db.query(
    `SELECT e.event_id, e.title, e.content, e.is_pinned, e.login_id, e.status, e.created_at, e.updated_at,
            u.name AS author_name
     FROM events e
     LEFT JOIN users u ON e.login_id = u.login_id
     WHERE e.status = 0
     ORDER BY e.is_pinned DESC, e.created_at DESC`
  );
  return rows;
};

//イベント詳細ページ
export const getEventDetail = async (event_id) => {
  const [[row]] = await db.query(
    `SELECT e.event_id, e.title, e.content, e.is_pinned, e.login_id, e.status, 
            e.is_banner, e.banner_start_at, e.banner_end_at, e.banner_priority, 
            e.banner_link_url, e.thumbnail_path, e.banner_path,
            e.created_at, e.updated_at,
            u.name AS author_name
     FROM events e
     LEFT JOIN users u ON e.login_id = u.login_id
     WHERE e.event_id = ? AND e.status = 0`,
    [event_id]
  );
  return row || null;
};

//イベントの作成
export const createEvent = async (login_id, data, files, conn) => {
  const executor = conn || db;
  const [[rows]] = await executor.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(event_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM events"
  );
  const event_id = `EV${rows.n}`;
  
  let finalLink = data.banner_link_url;
  if (data.is_banner == 1 && data.banner_link_type === "auto") {
    finalLink = `/event/${event_id}`; //自動生成パス
  }

  const thumbnail = files.thumbnail ? files.thumbnail[0].filename : null;
  const banner_image = files.banner_image ? files.banner_image[0].filename : null;
  
  await executor.query(
    `INSERT INTO events (event_id, login_id, title, content, is_pinned, is_banner, banner_start_at, banner_end_at, banner_priority, 
      banner_link_url, thumbnail_path, banner_path ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [event_id, login_id, data.title, data.content, data.is_pinned || 0,
      data.is_banner || 0, data.is_banner == 1 ? data.banner_start_at : null,
      data.is_banner == 1 ? data.banner_end_at : null, data.banner_priority || 1,
      finalLink, thumbnail, banner_image]
  );
  return event_id;
};

//イベントの修正
export const updateEvent = async (event_id, updateData, conn) => {
  const executor = conn || db;
  const { 
    title, content, is_pinned, is_banner, 
    banner_priority, banner_link_url, banner_start_at, banner_end_at,
    thumbnail_path, banner_path 
  } = updateData;

  let query = `
    UPDATE events 
    SET title = ?, content = ?, is_pinned = ?, is_banner = ?, 
        banner_priority = ?, banner_link_url = ?, 
        banner_start_at = ?, banner_end_at = ?
  `;
  const params = [
    title, content, is_pinned, is_banner, 
    banner_priority, banner_link_url, banner_start_at, banner_end_at
  ];

  if (thumbnail_path) {
    query += `, thumbnail_path = ?`;
    params.push(thumbnail_path);
  }

  if (banner_path) {
    query += `, banner_path = ?`;
    params.push(banner_path);
  }

  query += ` WHERE event_id = ?`;
  params.push(event_id);

  const [result] = await executor.query(query, params);
  return result.affectedRows;
};

//お知らせ論理削除
export const deleteEvent = async (event_id) => {
  const [result] = await db.query(`UPDATE events SET status = 1 WHERE event_id = ?`, [event_id]);
  return result.affectedRows;
};
