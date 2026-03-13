const db = require('../config/db');

class CourseModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM courses');
        return rows;
    }

    static async getSubjects(courseId) {
        const [rows] = await db.query('SELECT * FROM subjects WHERE course_id = ? ORDER BY semester', [courseId]);
        return rows;
    }
}

module.exports = CourseModel;
