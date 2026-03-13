const db = require('../config/db');

class AdmissionModel {
    static async getAllApplications() {
        const [rows] = await db.query(`
            SELECT a.*, c.name as course_name 
            FROM admission_applications a
            JOIN courses c ON a.course_applied = c.id
            ORDER BY a.created_at DESC
        `);
        return rows;
    }

    static async getApplicationById(id) {
        const [rows] = await db.query(`
            SELECT a.*, c.name as course_name 
            FROM admission_applications a
            JOIN courses c ON a.course_applied = c.id
            WHERE a.id = ?
        `, [id]);
        return rows[0];
    }

    static async updateStatus(id, status) {
        await db.query('UPDATE admission_applications SET status = ? WHERE id = ?', [status, id]);
    }
}

module.exports = AdmissionModel;
