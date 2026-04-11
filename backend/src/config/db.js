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
  timezone: '+00:00', //注文時間がUTCに統一されているため、ユーザーのローカル時間を表示するように変更
  //保存時間自体はUTCです。ユーザーの時間に変更するだけです。
});

export default db;