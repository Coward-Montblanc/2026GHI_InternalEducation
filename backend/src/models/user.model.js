import db from "../config/db.js";

export async function findAllUsers() { //회원 조회
  const [rows] = await db.execute(
    // 새로운 컬럼들 추가
    `SELECT user_id, login_id, name, email, phone, zip_code, address, address_detail, role, created_at FROM users`
  );
  return rows;
}

export async function createUser({ login_id, password, name, email, phone, zip_code, address, address_detail, role }) { //회원 추가
  const [result] = await db.execute(
    `
    INSERT INTO users (login_id, password, name, email, phone, zip_code, address, address_detail, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [login_id, password, name, email, phone, zip_code, address, address_detail, role]
  );
  return result;
}

export async function deleteUserById(user_id) { //회원 삭제
  const [result] = await db.execute(
    `DELETE FROM users WHERE user_id = ?`,
    [user_id]
  );
  return result;
}

export async function updateUser( //회원정보 수정
  user_id,
  { login_id, name, email, phone, zip_code, address, address_detail, role, password }
) {
  let sql = `
    UPDATE users
    SET login_id = ?, name = ?, email = ?, phone = ?, zip_code = ?, address = ?, address_detail = ?, role = ?
  `;

  const params = [login_id, name, email, phone, zip_code, address, address_detail, role];

  if (password) {
    sql += `, password = ?`;
    params.push(password);
  }

  sql += ` WHERE user_id = ?`;
  params.push(user_id);

  const [result] = await db.execute(sql, params);
  return result;
}