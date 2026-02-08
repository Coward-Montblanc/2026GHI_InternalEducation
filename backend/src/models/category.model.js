import db from "../config/db.js";

// 모든 카테고리 조회 (delflag='N'만)
export const getAllCategories = async () => {
  const [rows] = await db.query(`
    SELECT category_id, name, delflag
    FROM categories
    WHERE delflag = 'N'
    ORDER BY category_id
  `);
  return rows;
};

// 카테고리 ID로 조회
export const getCategoryById = async (categoryId) => {
  const [rows] = await db.query(
    `
    SELECT category_id, name, delflag
    FROM categories
    WHERE category_id = ?
  `,
    [categoryId]
  );
  return rows[0] || null;
};

// 카테고리 생성
export const createCategory = async (name) => {
  const [result] = await db.query(
    `
    INSERT INTO categories (name, delflag)
    VALUES (?, 'N')
  `,
    [name]
  );
  return result.insertId;
};

// 카테고리 수정
export const updateCategory = async (categoryId, name) => {
  const [result] = await db.query(
    `
    UPDATE categories
    SET name = ?
    WHERE category_id = ?
  `,
    [name, categoryId]
  );
  return result.affectedRows;
};

// 카테고리 삭제
// 카테고리 논리삭제 (delflag = 'Y')
export const deleteCategory = async (categoryId) => {
  const [result] = await db.query(
    `
    UPDATE categories
    SET delflag = 'Y'
    WHERE category_id = ?
  `,
    [categoryId]
  );
  return result.affectedRows;
};