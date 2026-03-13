const db = require('../config/db');

class ResultModel {
    static async uploadMarks(examTimetableId, records) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insert or update results
            for (const record of records) {
                const { student_id, marks } = record;
                await connection.query(
                    `INSERT INTO results (exam_timetable_id, student_id, marks_obtained) 
                     VALUES (?, ?, ?) 
                     ON DUPLICATE KEY UPDATE marks_obtained = ?`,
                    [examTimetableId, student_id, marks, marks]
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

    static async getStudentResults(studentId) {
        const [rows] = await db.query(
            `SELECT 
                r.marks_obtained, 
                et.exam_date,
                100 as max_marks,
                s.name as subject_name, 
                s.code,
                es.exam_name
             FROM results r 
             JOIN exam_timetable et ON r.exam_timetable_id = et.id
             JOIN exam_schedules es ON et.exam_schedule_id = es.id
             JOIN subjects s ON et.subject_id = s.id 
             WHERE r.student_id = ?`,
            [studentId]
        );
        return rows;
    }
}

module.exports = ResultModel;
