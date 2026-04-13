export const buildDynamicQuery = (baseSql, filters = {}, options = {}) => {
    let sql = `${baseSql} WHERE 1=1`;
    const params = [];

    Object.keys(filters).forEach((key) => {
        const value = filters[key];
        const operator = options[key] || '='; // デフォルトは '='

        //タイプに合わせてクエリステートメントにまとめる
        if (value !== undefined && value !== null && value !== '') {
            if (operator === 'LIKE') {
                sql += ` AND ${key} LIKE ?`;
                params.push(`%${value}%`);
            } else if (operator === 'BETWEEN' && Array.isArray(value)) {
                sql += ` AND ${key} BETWEEN ? AND ?`;
                params.push(value[0], value[1]);
            } else {
                sql += ` AND ${key} = ?`;
                params.push(value);
            }
        }
    });

    return { sql, params };
};