const db = require('../config/db');

class StudentModel {
    static async create(studentData, connection = db) {
        const {
            user_id,
            enrollment_number,
            first_name,
            last_name,
            profile_pic,
            mobile_number,
            gender,
            dob,
            address,
            guardian_name,
            guardian_number,
            guardian_relation,
            course_id
        } = studentData;

        const [result] = await connection.query(
            `INSERT INTO students 
            (user_id, enrollment_number, first_name, last_name, profile_pic, mobile_number, gender, dob, address, guardian_name, guardian_number, guardian_relation, course_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [user_id, enrollment_number, first_name, last_name, profile_pic, mobile_number, gender, dob, address, guardian_name, guardian_number, guardian_relation, course_id]
        );

        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT s.*, u.email, c.name as course_name 
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON s.course_id = c.id
        `);
        return rows;
    }
}

module.exports = StudentModel;
