const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = User;
