import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4', 
  collation: 'utf8mb4_unicode_ci',
  connectTimeout: 10000,
  timezone: '+00:00', // 주문 시간이 UTC로 통일되어있었기에 사용자 로컬 시간을 표시하도록 변경
  //저장시간 자체는 UTC입니다. 사용자의 시간으로 변경만 해줍니다. 
});

export default db;