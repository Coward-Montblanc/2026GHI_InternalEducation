import db from "../config/db.js";

//공지 일란(논리삭제 제외)
export const getNotices = async () => {
  const [rows] = await db.query(
    `SELECT n.notice_id, n.title, n.content, n.is_pinned, n.login_id, n.status, n.created_at, n.updated_at,
            u.name AS author_name
     FROM notices n
     LEFT JOIN users u ON n.login_id = u.login_id
     WHERE n.status = 0
     ORDER BY n.is_pinned DESC, n.created_at DESC`
  );
  return rows;
};

//공지 상세조회(공개중인 것만 볼 수 있도록)
export const getNoticeDetail = async (notice_id) => {
  const [[row]] = await db.query(
    `SELECT n.notice_id, n.title, n.content, n.is_pinned, n.login_id, n.status, n.created_at, n.updated_at,
            u.name AS author_name
     FROM notices n
     LEFT JOIN users u ON n.login_id = u.login_id
     WHERE n.notice_id = ? AND n.status = 0`,
    [notice_id]
  );
  return row || null;
};

//공지 등록
//BIGINT AUTO_INCREMENT방식을 쓰면 DB에 CT1 이런 방식이 아니라 1 이렇게만 들어감. max +1방식으로 변경
export const createNotice = async (login_id, title, content, is_pinned = 0) => {
  const [[rows]] = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(notice_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM notices"
  );
  const notice_id = `NT${rows.n}`;
  await db.query(
    "INSERT INTO notices (notice_id, login_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)",
    [notice_id, login_id, title, content, is_pinned]
  );
  return notice_id;
};

//공지 갱신
export const updateNotice = async (notice_id, title, content, is_pinned) => {
  const [result] = await db.query(
    `UPDATE notices SET title = ?, content = ?, is_pinned = ? WHERE notice_id = ?`,
    [title, content, is_pinned ?? 0, notice_id]
  );
  return result.affectedRows;
};

//공지 논리삭제
export const deleteNotice = async (notice_id) => {
  const [result] = await db.query(`UPDATE notices SET status = 1 WHERE notice_id = ?`, [notice_id]);
  return result.affectedRows;
};
