import db from "../config/db.js";
import { buildDynamicQuery } from '../utils/queryBuilder.js';

export const findCodesByGroup = async (filters) => {
  const baseSql = `SELECT code_id, group_code, code_value AS value, code_name AS label, attr1 AS format, is_used FROM common_codes`;
  
  const { sql, params } = buildDynamicQuery(baseSql, filters, { code_name: 'LIKE' });

  const finalSql = `${sql} ORDER BY sort_order ASC`;
  const [rows] = await db.query(finalSql, params);

  return rows;
};

export const createCommonCode = async (codeData) => {
  const { group_code, code_value, code_name, attr1, sort_order } = codeData;

  let finalSortOrder = sort_order;

  if (finalSortOrder === undefined || finalSortOrder === null) {
    const [maxOrderResult] = await db.query(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order 
       FROM common_codes 
       WHERE group_code = ?`,
      [group_code]
    );
    finalSortOrder = maxOrderResult[0].next_order;
  }

  let columns = ['group_code', 'code_value', 'code_name', 'sort_order'];
  let values = [group_code, code_value, code_name, finalSortOrder];
  let placeholders = ['?', '?', '?', '?'];

  if (attr1 !== undefined && attr1 !== null) {
    columns.push('attr1');
    values.push(attr1);
    placeholders.push('?');
  }

  if (sort_order !== undefined && sort_order !== null) {
    columns.push('sort_order');
    values.push(sort_order);
    placeholders.push('?');
  }

  const query = `
    INSERT INTO common_codes (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
  `;
  
  const [result] = await db.query(query, values);

  return result.insertId;
};

export const updateCodeStatus = async (codeId, isUsed) => { //is_used 有効、無効
  const query = `
    UPDATE common_codes 
    SET is_used = ? 
    WHERE code_id = ?
  `;
  
  const [result] = await db.query(query, [isUsed, codeId]);
  return result.affectedRows > 0;
};