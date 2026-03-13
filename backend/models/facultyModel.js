const db = require('../config/db');

class FacultyModel {
    static async getDashboard(userId) {
        const [faculty] = await db.query('SELECT * FROM faculty WHERE user_id = ?', [userId]);
        if (!faculty[0]) return null;

        const facultyId = faculty[0].id;

        // Get assigned subjects
        const [subjects] = await db.query(
            "SELECT s.*, c.name as course_name " +
            "FROM faculty_subjects fs " +
            "JOIN subjects s ON fs.subject_id = s.id " +
            "JOIN courses c ON s.course_id = c.id " +
            "WHERE fs.faculty_id = ?", [facultyId]);

        return {
            profile: faculty[0],
            subjects
        };
    }

    static async getStudentsInSubject(subjectId) {
        // Get students based on course and semester matching the subject
        const [students] = await db.query(`
            SELECT 
                s.id, 
                s.enrollment_number, 
                s.first_name, 
                s.last_name,
                c.name as course_name
            FROM students s
            JOIN courses c ON s.course_id = c.id
            JOIN subjects sub ON sub.course_id = c.id
            WHERE sub.id = ? 
            AND s.current_semester = sub.semester
            AND s.status = 'ACTIVE'
            ORDER BY s.enrollment_number
        `, [subjectId]);
        return students;
    }

    static async markAttendance(facultyId, subjectId, date, records) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            for (const record of records) {
                const { student_id, status } = record;

                // insert or update
                await connection.query(
                    "INSERT INTO attendance (student_id, subject_id, faculty_id, date, status) " +
                    "VALUES (?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE status = ?",
                    [student_id, subjectId, facultyId, date, status, status]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getFacultyByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM faculty WHERE user_id = ?', [userId]);
        return rows[0];
    }
}

module.exports = FacultyModel;
