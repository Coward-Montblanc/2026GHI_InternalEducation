import db from "../config/db.js";

//이벤트 목록(논리삭제 제외)
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

//이벤트 상세페이지
export const getEventDetail = async (event_id) => {
  const [[row]] = await db.query(
    `SELECT e.event_id, e.title, e.content, e.is_pinned, e.login_id, e.status, e.created_at, e.updated_at,
            u.name AS author_name
     FROM events e
     LEFT JOIN users u ON e.login_id = u.login_id
     WHERE e.event_id = ? AND e.status = 0`,
    [event_id]
  );
  return row || null;
};

//이벤트 생성
//BIGINT AUTO_INCREMENT방식을 쓰면 DB에 CT1 이런 방식이 아니라 1 이렇게만 들어감. max +1방식으로 변경
//이러면 동시에 입력한게 같은 번호로 들어올 확률 있음. 추후 AUTO_INCREMENT로 수정예정
export const createEvent = async (login_id, title, content, is_pinned = 0) => {
  const [[rows]] = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(event_id, 3) AS UNSIGNED)), 0) + 1 AS n FROM events"
  );
  const event_id = `EV${rows.n}`;
  await db.query(
    "INSERT INTO events (event_id, login_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)",
    [event_id, login_id, title, content, is_pinned]
  );
  return event_id;
};

//이벤트 수정
export const updateEvent = async (event_id, title, content, is_pinned) => {
  const [result] = await db.query(
    `UPDATE events SET title = ?, content = ?, is_pinned = ? WHERE event_id = ?`,
    [title, content, is_pinned ?? 0, event_id]
  );
  return result.affectedRows;
};

//공지 논리삭제
export const deleteEvent = async (event_id) => {
  const [result] = await db.query(`UPDATE events SET status = 1 WHERE event_id = ?`, [event_id]);
  return result.affectedRows;
};
