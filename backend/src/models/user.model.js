import db from "../config/db.js";

export async function findByLoginId(login_id) { //로그인용 아이디 찾기 함수
  const [rows] = await db.execute(
    `SELECT * FROM users WHERE login_id = ?`, 
    [login_id]
  );
  return rows[0]; // 없으면 undefined
}

export async function findAllUsers() { //회원 조회
  const [rows] = await db.execute(
    `SELECT login_id, password, name, email, phone, zip_code, address, address_detail, role, created_at FROM users`
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

export async function deleteUserById(login_id) { //회원 삭제
  const [result] = await db.execute(
    `DELETE FROM users WHERE login_id = ?`,
    [login_id]
  );
  return result;
}

export async function updateUser( //회원정보 수정
  login_id,
  { name, email, phone, zip_code, address, address_detail, role, password }
) {
  let sql = `
    UPDATE users
    SET name = ?, email = ?, phone = ?, zip_code = ?, address = ?, address_detail = ?, role = ?
  `;

  const params = [name, email, phone, zip_code, address, address_detail, role];

  if (password) {
    sql += `, password = ?`;
    params.push(password);
  }

  sql += ` WHERE login_id = ?`;
  params.push(login_id);

  const [result] = await db.execute(sql, params);
  return result;
}