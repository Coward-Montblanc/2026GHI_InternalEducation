import db from "../config/db.js";

//お知らせイラン（論理削除を除く）
export const getNotices = async () => {
  const [rows] = await db.query(
    `SELECT n.notice_id, n.title, n.content, n.is_pinned, n.login_id, n.status, 
            n.is_banner, n.banner_priority, n.thumbnail_path,
            n.created_at, n.updated_at,
            u.name AS author_name
     FROM notices n
     LEFT JOIN users u ON n.login_id = u.login_id
     WHERE n.status = 0
     ORDER BY n.is_pinned DESC, n.created_at DESC`
  );
  return rows;
};

//お知らせ詳細照会（公開中のもののみ見られるように）
export const getNoticeDetail = async (notice_id) => {
  const [[row]] = await db.query(
    `SELECT n.notice_id, n.title, n.content, n.is_pinned, n.login_id, n.status, 
            n.is_banner, n.banner_start_at, n.banner_end_at, n.banner_priority, 
            n.banner_link_url, n.thumbnail_path, n.banner_path,
            n.created_at, n.updated_at,
            u.name AS author_name
     FROM notices n
     LEFT JOIN users u ON n.login_id = u.login_id
     WHERE n.notice_id = ? AND n.status = 0`,
    [notice_id]
  );
  return row || null;
};

//お知らせ登録
export const createNotice = async (login_id, data, files, conn) => {
  const executor = conn || db;
  const [[rows]] = await executor.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(notice_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM notices"
  );
  const notice_id = `NT${rows.n}`;
  
  let finalLink = data.banner_link_url;
  if (data.is_banner == 1 && data.banner_link_type === "auto") {
    finalLink = `/notice/${notice_id}`; //自動生成パス
  }

  const thumbnail = files.thumbnail ? files.thumbnail[0].filename : null;
  const banner_image = files.banner_image ? files.banner_image[0].filename : null;
  
  await executor.query(
    `INSERT INTO notices (notice_id, login_id, title, content, is_pinned, is_banner, banner_start_at, banner_end_at, banner_priority, 
      banner_link_url, thumbnail_path, banner_path ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [notice_id, login_id, data.title, data.content, data.is_pinned || 0,
      data.is_banner || 0, data.is_banner == 1 ? data.banner_start_at : null,
      data.is_banner == 1 ? data.banner_end_at : null, data.banner_priority || 1,
      finalLink, thumbnail, banner_image]
  );
  return notice_id;
};

//お知らせの更新
export const updateNotice = async (notice_id, updateData, conn) => {
  const executor = conn || db;
  const { 
    title, content, is_pinned, is_banner, 
    banner_priority, banner_link_url, banner_start_at, banner_end_at,
    thumbnail_path, banner_path 
  } = updateData;

  let query = `
    UPDATE notices 
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

  query += ` WHERE notice_id = ?`;
  params.push(notice_id);

  const [result] = await executor.query(query, params);
  return result.affectedRows;
};

//お知らせ論理削除
export const deleteNotice = async (notice_id) => {
  const [result] = await db.query(`UPDATE notices SET status = 1 WHERE notice_id = ?`, [notice_id]);
  return result.affectedRows;
};
