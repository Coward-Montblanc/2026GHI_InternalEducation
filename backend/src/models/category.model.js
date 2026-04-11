import db from "../config/db.js";

//すべてのカテゴリルックアップ（delflag = 'N'のみ）
export const getAllCategories = async () => {
  const [rows] = await db.query(`
    SELECT category_id, name, delflag
    FROM categories
    WHERE delflag = 'N'
    ORDER BY category_id
  `);
  return rows;
};

//カテゴリIDで検索
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

//カテゴリの作成
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

//カテゴリを編集
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

//カテゴリ論理削除（delflag = 'Y'）、実際の削除はありません。
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