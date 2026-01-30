//회원 관련 쿼리문 모델

import db from "../config/db.js";

export async function findAllUsers() { //회원 정보 조회
  const [rows] = await db.execute(
    `SELECT user_id, login_id, name, email, role, created_at FROM users`
  );
  return rows;
}

export async function createUser({ login_id, password, name, email, role }) { //회원 등록 
  const [result] = await db.execute(
    `
    INSERT INTO users (login_id, password, name, email, role)
    VALUES (?, ?, ?, ?, ?)
    `,
    [login_id, password, name, email, role]
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
  { login_id, password, name, email, role }
) {
  let sql = `
    UPDATE users
    SET login_id = ?, name = ?, email = ?, role = ?
  `;

  const params = [login_id, name, email, role];

  if (password) {
    sql += `, password = ?`;
    params.push(password);
  }

  sql += ` WHERE user_id = ?`;
  params.push(user_id);

  console.log("SQL:", sql); //sql문 잘 전달되는지 확인
  console.log("PARAMS:", params); 
  const [result] = await db.execute(sql, params);
  return result;
}