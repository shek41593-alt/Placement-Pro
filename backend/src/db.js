const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) return createDefaultDB();
        const data = fs.readFileSync(DB_PATH, 'utf8').trim();
        if (!data) return createDefaultDB();
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading DB:', err);
        return createDefaultDB();
    }
};

const createDefaultDB = () => ({
    users: [], profiles: [], drives: [], applications: [],
    interviews: [], faq_entries: [], alumni_posts: [],
    mentorship_bookings: [], notifications: [], resume_versions: [],
    broadcasts: [], chat_logs: []
});

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing DB:', err);
    }
};

/**
 * Resolve table name from SQL text
 */
const resolveTable = (sql) => {
    if (sql.includes('from users') || sql.startsWith('update users') || sql.includes('into users')) return 'users';
    if (sql.includes('from profiles') || sql.startsWith('update profiles') || sql.includes('into profiles')) return 'profiles';
    if (sql.includes('from drives') || sql.startsWith('update drives') || sql.includes('into drives')) return 'drives';
    if (sql.includes('from applications') || sql.startsWith('update applications') || sql.includes('into applications')) return 'applications';
    if (sql.includes('from notifications') || sql.startsWith('update notifications') || sql.includes('into notifications')) return 'notifications';
    if (sql.includes('from alumni_posts') || sql.startsWith('update alumni_posts') || sql.includes('into alumni_posts')) return 'alumni_posts';
    if (sql.includes('from faq_entries') || sql.startsWith('update faq_entries') || sql.includes('into faq_entries')) return 'faq_entries';
    if (sql.includes('from mentorship_bookings') || sql.startsWith('update mentorship_bookings') || sql.includes('into mentorship_bookings')) return 'mentorship_bookings';
    if (sql.includes('from interviews') || sql.startsWith('update interviews') || sql.includes('into interviews')) return 'interviews';
    if (sql.includes('from resume_versions') || sql.includes('into resume_versions')) return 'resume_versions';
    if (sql.includes('from chat_logs') || sql.includes('into chat_logs')) return 'chat_logs';
    if (sql.includes('from broadcasts') || sql.includes('into broadcasts')) return 'broadcasts';
    return '';
};

/**
 * Parse column list from UPDATE SET clause without splitting on commas inside array literals.
 * Returns array of column names in order, matching params array.
 */
const parseSetColumns = (text) => {
    // Extract the SET ... WHERE section
    const setMatch = text.match(/set\s+([\s\S]+?)\s+where\s/i);
    if (!setMatch) return [];

    const setPart = setMatch[1];
    const columns = [];

    // We need to split on commas that separate col=$N, but NOT commas inside array literals
    // Strategy: collect tokens like `colname =$N` using regex
    const tokenRegex = /([a-z_][a-z0-9_]*)\s*=\s*\$(\d+)/gi;
    let match;
    while ((match = tokenRegex.exec(setPart)) !== null) {
        columns.push({ col: match[1].trim().toLowerCase(), paramIdx: parseInt(match[2]) - 1 });
    }
    return columns;
};

const query = async (text, params = []) => {
    const db = readDB();
    const sql = text.trim().toLowerCase();

    // ──────────────────────────────────────────────
    // 1. SELECT  
    // ──────────────────────────────────────────────
    if (sql.startsWith('select')) {
        const tableName = resolveTable(sql);
        if (!tableName) {
            console.warn('Unhandled SELECT (no table):', text);
            return { rows: [] };
        }

        let rows = (db[tableName] || []).map(r => ({ ...r })); // shallow copies

        // ── WHERE filters ──
        const normSql = sql.replace(/\s+/g, '');
        if (normSql.includes('email=$1')) {
            rows = rows.filter(r => r.email === params[0]);
        } else if (normSql.includes('user_id=$1') || normSql.includes('.user_id=$1')) {
            rows = rows.filter(r => r.user_id == params[0]);
        } else if ((normSql.includes('id=$1') || normSql.includes('.id=$1')) && !normSql.includes('user_id=$1')) {
            rows = rows.filter(r => r.id == params[0]);
        } else if (normSql.includes('drive_id=$1') || normSql.includes('.drive_id=$1')) {
            rows = rows.filter(r => r.drive_id == params[0]);
        } else if (normSql.includes("role='student'")) {
            rows = rows.filter(r => r.role === 'student');
        } else if (normSql.includes("role='alumni'")) {
            rows = rows.filter(r => r.role === 'alumni');
        } else if (normSql.includes("role='tpo'")) {
            rows = rows.filter(r => r.role === 'tpo');
        } else if (normSql.includes("student_id=$1")) {
            rows = rows.filter(r => r.student_id == params[0]);
        } else if (normSql.includes("alumni_id=$1")) {
            rows = rows.filter(r => r.alumni_id == params[0]);
        } else if (normSql.includes("is_active=true")) {
            rows = rows.filter(r => r.is_active === true || r.is_active === undefined);
        }

        // ── Additional compound filters on notifications ──
        if (tableName === 'notifications') {
            if (normSql.includes("user_id=$1")) {
                rows = rows.filter(r => r.user_id == params[0]);
            }
            if (normSql.includes("is_read=false") || normSql.includes("is_read='false'")) {
                rows = rows.filter(r => !r.is_read);
            }
        }

        // ── LEFT JOIN profiles ──
        if (sql.includes('left join profiles')) {
            rows = rows.map(u => {
                const p = (db.profiles || []).find(prof => prof.user_id === u.id) || {};
                // Ensure skills is always an array
                const skills = Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []);
                return { ...u, ...p, id: u.id, skills };
            });
        }

        // ── COUNT(*) aggregation ──
        if (normSql.includes('count(*)') || normSql.includes('count(distinct')) {
            if (normSql.includes('count(distinct')) {
                const fieldMatch = normSql.match(/count\(distinct\s+([a-z_]+)\)/);
                if (fieldMatch) {
                    const field = fieldMatch[1];
                    const unique = new Set(rows.map(r => r[field])).size;
                    return { rows: [{ count: unique }] };
                }
            }
            return { rows: [{ count: rows.length }] };
        }

        // ── MAX aggregation ──
        if (normSql.includes('max(')) {
            const fieldMatch = normSql.match(/max\(([a-z_.]+)\)/);
            const field = fieldMatch ? fieldMatch[1].split('.').pop() : null;
            const maxVal = field ? Math.max(0, ...rows.map(r => parseFloat(r[field]) || 0)) : 0;
            return { rows: [{ max_pkg: maxVal, max: maxVal }] };
        }

        // ── Ensure skills is always a real array in profile rows ──
        if (tableName === 'profiles') {
            rows = rows.map(r => ({
                ...r,
                skills: Array.isArray(r.skills) ? r.skills : (r.skills ? [r.skills] : [])
            }));
        }

        return { rows };
    }

    // ──────────────────────────────────────────────
    // 2. INSERT
    // ──────────────────────────────────────────────
    if (sql.startsWith('insert into')) {
        const tableName = resolveTable(sql);
        const tableData = db[tableName] || [];

        // Parse column names from INSERT INTO table (col1, col2, ...) VALUES
        const colMatch = text.match(/\(([^)]+)\)\s*values/i);
        if (!colMatch) {
            console.warn('Could not parse INSERT columns from:', text);
            return { rows: [] };
        }
        const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());

        const newRecord = {
            id: tableData.length > 0 ? Math.max(...tableData.map(r => r.id || 0)) + 1 : 1
        };
        columns.forEach((col, idx) => {
            newRecord[col] = params[idx] !== undefined ? params[idx] : null;
        });
        newRecord.created_at = new Date().toISOString();

        tableData.push(newRecord);
        db[tableName] = tableData;
        writeDB(db);

        return { rows: [newRecord] };
    }

    // ──────────────────────────────────────────────
    // 3. UPDATE
    // ──────────────────────────────────────────────
    if (sql.startsWith('update')) {
        const tableName = resolveTable(sql);
        const tableData = db[tableName] || [];

        const normSql = sql.replace(/\s+/g, '');
        const hasWhereUserId = normSql.includes('whereuser_id=$');
        const hasWhereId = normSql.includes('whereid=$');

        if (hasWhereUserId || hasWhereId) {
            const idToFind = params[params.length - 1];
            const index = tableData.findIndex(r =>
                hasWhereUserId ? r.user_id == idToFind : r.id == idToFind
            );

            if (index !== -1) {
                // Use robust column parser (handles array params safely)
                const colAssignments = parseSetColumns(text);

                if (colAssignments.length > 0) {
                    colAssignments.forEach(({ col, paramIdx }) => {
                        const val = params[paramIdx];
                        if (val !== undefined && col !== 'updated_at') {
                            // For skills: ensure it's stored as an array
                            if (col === 'skills') {
                                tableData[index][col] = Array.isArray(val)
                                    ? val
                                    : (typeof val === 'string' && val.startsWith('[')
                                        ? JSON.parse(val)
                                        : val ? [val] : []);
                            } else {
                                tableData[index][col] = val;
                            }
                        }
                    });
                } else {
                    // Fallback: positional assignment by param count -1 (for last = WHERE id)
                    const setParamCount = params.length - 1;
                    for (let i = 0; i < setParamCount; i++) {
                        // We just update what we can from params
                    }
                }

                tableData[index].updated_at = new Date().toISOString();
                db[tableName] = tableData;
                writeDB(db);
                return { rows: [tableData[index]] };
            }
        }

        // UPDATE notifications mark-read (special case: update by id with is_read)
        if (normSql.includes('setis_read') || normSql.includes('set is_read')) {
            const idToFind = params[params.length - 1];
            const index = tableData.findIndex(r => r.id == idToFind);
            if (index !== -1) {
                tableData[index].is_read = params[0];
                tableData[index].updated_at = new Date().toISOString();
                db[tableName] = tableData;
                writeDB(db);
                return { rows: [tableData[index]] };
            }
        }

        // Bulk mark-all-read for a user
        if (normSql.includes('setis_read=true') && normSql.includes('whereuser_id=$')) {
            const userId = params[0];
            db[tableName] = tableData.map(r => {
                if (r.user_id == userId) return { ...r, is_read: true };
                return r;
            });
            writeDB(db);
            return { rows: [] };
        }

        return { rows: [] };
    }

    // ──────────────────────────────────────────────
    // 4. DELETE
    // ──────────────────────────────────────────────
    if (sql.startsWith('delete')) {
        const tableName = resolveTable(sql);
        let tableData = db[tableName] || [];
        const normSql = sql.replace(/\s+/g, '');

        if (sql.includes('where')) {
            if (normSql.includes('id=$2') && normSql.includes('alumni_id=$1')) {
                tableData = tableData.filter(r => !(r.id == params[1] && r.alumni_id == params[0]));
            } else if (normSql.includes('id=$1')) {
                tableData = tableData.filter(r => r.id != params[0]);
            } else if (normSql.includes('user_id=$1') && normSql.includes('is_read')) {
                tableData = tableData.filter(r => !(r.user_id == params[0] && (r.is_read === true || r.is_read === 1)));
            } else if (normSql.includes('user_id=$1')) {
                tableData = tableData.filter(r => r.user_id != params[0]);
            }
        } else {
            tableData = [];
        }

        db[tableName] = tableData;
        writeDB(db);
        return { rows: [] };
    }

    console.warn('Unhandled SQL query in mock db:', text.substring(0, 100));
    return { rows: [] };
};

const resetDB = () => {
    writeDB(createDefaultDB());
};

module.exports = {
    query,
    resetDB,
    pool: { query, on: () => { } }
};
