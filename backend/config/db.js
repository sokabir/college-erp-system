const { Pool } = require('pg');
require('dotenv').config();

// Support both PostgreSQL connection string and individual parameters
const pool = new Pool(
    process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'college_erp',
        port: process.env.DB_PORT || 5432,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
);

// Wrapper to make it compatible with MySQL2 syntax
const db = {
    query: async (text, params) => {
        const result = await pool.query(text, params);
        return [result.rows, result.fields];
    },
    getConnection: async () => {
        const client = await pool.connect();
        return {
            query: async (text, params) => {
                const result = await client.query(text, params);
                return [result.rows, result.fields];
            },
            beginTransaction: async () => {
                await client.query('BEGIN');
            },
            commit: async () => {
                await client.query('COMMIT');
            },
            rollback: async () => {
                await client.query('ROLLBACK');
            },
            release: () => {
                client.release();
            }
        };
    }
};

module.exports = db;
