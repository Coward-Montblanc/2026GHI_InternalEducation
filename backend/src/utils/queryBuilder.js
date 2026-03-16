export const buildDynamicQuery = (baseSql, filters = {}, options = {}) => {
    let sql = `${baseSql} WHERE 1=1`;
    const params = [];

    Object.keys(filters).forEach((key) => {
        const value = filters[key];
        const operator = options[key] || '='; // 기본값은 '='

        if (value !== undefined && value !== null && value !== '') { //타입에 맞춰서 쿼리문에 합쳐짐
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