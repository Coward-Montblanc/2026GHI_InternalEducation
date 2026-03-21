import db from "../config/db.js";
import { buildDynamicQuery } from "../utils/queryBuilder.js"; //쿼리 조립 함수 임포트

export async function findUsersAdmin(filters) {
    const { limit, offset, ...searchFilters } = filters;

    const baseSql = `SELECT * FROM users`;

    const options = {
        name: 'LIKE',
        login_id: 'LIKE',
        email: 'LIKE',
        phone: 'LIKE',
        zip_code: 'LIKE',
        status: '=',
        role: '=',
        created_at: 'BETWEEN'
    };
    
    const { sql, params } = buildDynamicQuery(baseSql, searchFilters, options);
    
    const { sql: countSql, params: countParams } = buildDynamicQuery(
        "SELECT COUNT(*) as total FROM users", 
        searchFilters, 
        options
    );
    
    //조립 유틸 함수로 넘김
    const finalSql = `${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const finalParams = [ ...params, Number(limit), Number(offset) ];

    const [rows] = await db.query(finalSql, finalParams);
    const [countResult] = await db.execute(countSql, countParams);
    return {
        users: rows,
        totalCount: countResult[0].total
    };
}

export async function findByLoginId(login_id) { //로그인용 아이디 찾기 함수
  const [rows] = await db.execute(
    `SELECT * FROM users WHERE login_id = ?`, 
    [login_id]
  );
  return rows[0]; // 없으면 undefined
}

export async function findAllUsers() { //회원 조회
  const [rows] = await db.execute(
    `SELECT login_id, password, name, email, phone, zip_code, address, address_detail, status, role, created_at FROM users`
  );
  return rows;
}

export async function createUser({ login_id, password, name, email, phone, zip_code, address, address_detail, status, role }) { //회원 추가
  const [result] = await db.execute(
    `
    INSERT INTO users (login_id, password, name, email, phone, zip_code, address, address_detail, status, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `,
    [login_id, password, name, email, phone, zip_code, address, address_detail, role]
  );
  return result;
}

export async function createAddress(addressData) { //회원가입시 배송지 변경 테이블에 추가되는 함수
    const { login_id, address_name, name, zip_code, address, address_detail, phone, is_default = 0 } = addressData;
    const sql = `
        INSERT INTO delivery_addresses 
        (login_id, address_name, receiver_name, zip_code, address, address_detail, phone, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [login_id, address_name, name, zip_code, address, address_detail, phone, is_default]);
    return result;
}

export async function setDefaultAddress(login_id, address_name) {
  const connection = await db.getConnection(); // 트랜잭션을 위해 연결 객체 가져오기
  try {
    await connection.beginTransaction(); //트랜잭션 시작

    await connection.execute( `UPDATE delivery_addresses SET is_default = 0 WHERE login_id = ?` ,[login_id] ); //모든 배송지 상태 0 설정 : 일반 배송지

    const [result] = await connection.execute(
      `UPDATE delivery_addresses SET is_default = 1 WHERE login_id = ? AND address_name = ?`,
      [login_id, address_name]
    ); //선택한 배송지를 기본배송지로 설정

    await connection.commit();
    return result;
  } catch (err) { await connection.rollback();
    throw err; }
  finally { connection.release(); }
}

export async function findAddressesByLoginId(login_id) { //배송지 조회 함수
  const sql = `SELECT * FROM delivery_addresses WHERE login_id = ? ORDER BY is_default DESC`;
  const [rows] = await db.execute(sql, [login_id]);
  return rows;
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
  { name, email, phone, zip_code, address, address_detail, status, role, password }
) {
  let sql = `
    UPDATE users
    SET name = ?, email = ?, phone = ?, zip_code = ?, address = ?, address_detail = ?, status = ?, role = ?
  `;

  const params = [name, email, phone, zip_code, address, address_detail, status, role];

  if (password) {
    sql += `, password = ?`;
    params.push(password);
  }

  sql += ` WHERE login_id = ?`;
  params.push(login_id);

  const [result] = await db.execute(sql, params);
  return result;
}