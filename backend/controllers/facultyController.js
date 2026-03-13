const FacultyModel = require('../models/facultyModel');
const db = require('../config/db');

// @desc    Get Faculty Dashboard (Profile + Assigned Subjects + Stats)
// @route   GET /api/faculty/dashboard
// @access  Private (Role: faculty)
const getDashboard = async (req, res) => {
    try {
        const data = await FacultyModel.getDashboard(req.user.id);
        if (!data) return res.status(404).json({ message: 'Faculty profile not found' });

        // Get total students taught (only from semesters where faculty has assigned subjects)
        const [studentCount] = await db.query(`
            SELECT COUNT(DISTINCT s.id) as total
            FROM faculty_subjects fs
            JOIN subjects sub ON fs.subject_id = sub.id
            JOIN courses c ON sub.course_id = c.id
            JOIN students s ON s.course_id = c.id AND s.current_semester = sub.semester
            JOIN faculty f ON fs.faculty_id = f.id
            WHERE f.user_id = ? AND s.status = 'ACTIVE'
        `, [req.user.id]);

        // Get upcoming exams for faculty's subjects
        const [upcomingExams] = await db.query(`
            SELECT 
                et.id,
                et.exam_date,
                et.exam_time_from,
                et.exam_time_to,
                s.name as subject_name,
                s.code as subject_code,
                es.exam_name,
                es.semester
            FROM exam_timetable et
            JOIN exam_schedules es ON et.exam_schedule_id = es.id
            JOIN subjects s ON et.subject_id = s.id
            JOIN faculty_subjects fs ON s.id = fs.subject_id
            JOIN faculty f ON fs.faculty_id = f.id
            WHERE f.user_id = ? 
            AND es.is_published = TRUE
            AND et.exam_date >= CURRENT_DATE()
            ORDER BY et.exam_date, et.exam_time_from
            LIMIT 5
        `, [req.user.id]);

        // Get recent notices
        const [notices] = await db.query(`
            SELECT id, title, message, priority, created_at
            FROM notices
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // Get attendance stats (last 30 days)
        const [attendanceStats] = await db.query(`
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count
            FROM attendance a
            JOIN faculty_subjects fs ON a.subject_id = fs.subject_id
            JOIN faculty f ON fs.faculty_id = f.id
            WHERE f.user_id = ?
            AND a.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        `, [req.user.id]);

        const attendanceRate = attendanceStats[0].total_records > 0 
            ? ((attendanceStats[0].present_count / attendanceStats[0].total_records) * 100).toFixed(1)
            : 0;

        res.json({
            ...data,
            stats: {
                total_students: studentCount[0].total || 0,
                total_subjects: data.subjects.length,
                attendance_rate: parseFloat(attendanceRate),
                upcoming_exams_count: upcomingExams.length
            },
            upcoming_exams: upcomingExams,
            recent_notices: notices
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get students enrolled in a subject
// @route   GET /api/faculty/subject/:subjectId/students
// @access  Private
const getStudentsBySubject = async (req, res) => {
    try {
        const students = await FacultyModel.getStudentsInSubject(req.params.subjectId);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark attendance for a subject
// @route   POST /api/faculty/attendance
// @access  Private
const markAttendance = async (req, res) => {
    try {
        const { subject_id, date, records } = req.body; // records: [{student_id, status}]

        const faculty = await FacultyModel.getFacultyByUserId(req.user.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        await FacultyModel.markAttendance(faculty.id, subject_id, date, records);

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error marking attendance' });
    }
};

// @desc    Get scheduled exams for faculty's subjects
// @route   GET /api/faculty/scheduled-exams
// @access  Private
const getScheduledExams = async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT 
                et.id as timetable_id,
                et.exam_date,
                et.exam_time_from,
                et.exam_time_to,
                et.subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.semester,
                es.exam_name,
                es.id as exam_schedule_id,
                c.name as course_name,
                c.short_code
            FROM exam_timetable et
            JOIN exam_schedules es ON et.exam_schedule_id = es.id
            JOIN subjects s ON et.subject_id = s.id
            JOIN courses c ON s.course_id = c.id
            JOIN faculty_subjects fs ON s.id = fs.subject_id
            JOIN faculty f ON fs.faculty_id = f.id
            WHERE f.user_id = ? 
            AND es.is_published = TRUE
            ORDER BY et.exam_date DESC, et.exam_time_from
        `, [req.user.id]);
        
        res.json(exams);
    } catch (error) {
        console.error('Error fetching scheduled exams:', error);
        res.status(500).json({ message: 'Server error fetching scheduled exams' });
    }
};

// @desc    Upload marks for a subject
// @route   POST /api/faculty/marks
// @access  Private
const uploadMarks = async (req, res) => {
    try {
        const { exam_timetable_id, records } = req.body; // records: [{student_id, marks}]
        const ResultModel = require('../models/resultModel');

        await ResultModel.uploadMarks(exam_timetable_id, records);
        res.json({ message: 'Marks uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error uploading marks' });
    }
};

// @desc    Get attendance records for a subject and date
// @route   GET /api/faculty/attendance/:subjectId/:date
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const { subjectId, date } = req.params;
        
        const [records] = await db.query(`
            SELECT 
                a.id,
                a.student_id,
                a.status,
                s.enrollment_number,
                s.first_name,
                s.last_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.subject_id = ? AND a.date = ?
            ORDER BY s.enrollment_number
        `, [subjectId, date]);
        
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Server error fetching attendance' });
    }
}

// @desc    Get attendance history for a subject (last 30 days)
// @route   GET /api/faculty/attendance-history/:subjectId
// @access  Private (Faculty)
getAttendanceHistory = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        const [records] = await db.query(`
            SELECT 
                a.id,
                a.student_id,
                a.status,
                a.date,
                s.enrollment_number,
                s.first_name,
                s.last_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.subject_id = ?
            AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY a.date DESC, s.enrollment_number
        `, [subjectId]);
        
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        res.status(500).json({ message: 'Server error fetching attendance history' });
    }
};

// @desc    Get all students for faculty's assigned subjects
// @route   GET /api/faculty/students
// @access  Private
const getStudents = async (req, res) => {
    try {
        // Get students only from semesters where faculty has assigned subjects
        const [students] = await db.query(`
            SELECT DISTINCT 
                s.id,
                s.enrollment_number,
                s.first_name,
                s.last_name,
                c.name as course_name,
                c.short_code,
                u.email,
                s.current_semester as semester
            FROM faculty_subjects fs
            JOIN subjects sub ON fs.subject_id = sub.id
            JOIN courses c ON sub.course_id = c.id
            JOIN students s ON s.course_id = c.id AND s.current_semester = sub.semester
            JOIN users u ON s.user_id = u.id
            WHERE fs.faculty_id = (SELECT id FROM faculty WHERE user_id = ?) 
                AND s.status = 'ACTIVE'
            ORDER BY s.current_semester, s.enrollment_number
        `, [req.user.id]);
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error fetching students' });
    }
};

// @desc    Get results for faculty's exams
// @route   GET /api/faculty/results
// @access  Private
const getResults = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                r.id,
                r.marks_obtained,
                s.id as student_id,
                s.enrollment_number,
                s.first_name,
                s.last_name,
                sub.name as subject_name,
                sub.code as subject_code,
                sub.semester,
                es.exam_name,
                et.exam_date,
                c.name as course_name,
                c.short_code
            FROM results r
            JOIN students s ON r.student_id = s.id
            JOIN exam_timetable et ON r.exam_timetable_id = et.id
            JOIN exam_schedules es ON et.exam_schedule_id = es.id
            JOIN subjects sub ON et.subject_id = sub.id
            JOIN courses c ON sub.course_id = c.id
            JOIN faculty_subjects fs ON sub.id = fs.subject_id
            JOIN faculty f ON fs.faculty_id = f.id
            WHERE f.user_id = ?
            ORDER BY et.exam_date DESC, sub.name, s.enrollment_number
        `, [req.user.id]);
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Server error fetching results' });
    }
};

// @desc    Get assignments for faculty's subjects
// @route   GET /api/faculty/assignments
// @access  Private
const getAssignments = async (req, res) => {
    try {
        const [assignments] = await db.query(`
            SELECT 
                a.id,
                a.title,
                a.description,
                a.file_path,
                a.due_date,
                a.max_marks,
                a.created_at,
                s.name as subject_name,
                s.code as subject_code,
                s.semester,
                c.name as course_name,
                c.short_code
            FROM assignments a
            JOIN subjects s ON a.subject_id = s.id
            JOIN courses c ON s.course_id = c.id
            WHERE a.faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
            ORDER BY a.due_date DESC, a.created_at DESC
        `, [req.user.id]);
        
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

// @desc    Create new assignment
// @route   POST /api/faculty/assignments
// @access  Private
const createAssignment = async (req, res) => {
    try {
        const { subject_id, title, description, due_date, max_marks } = req.body;
        // Store relative path instead of absolute path
        const file_path = req.file ? `uploads/${req.file.filename}` : null;
        
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        const [result] = await db.query(`
            INSERT INTO assignments (subject_id, faculty_id, title, description, file_path, due_date, max_marks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [subject_id, faculty[0].id, title, description, file_path, due_date, max_marks || 100]);
        
        res.status(201).json({ message: 'Assignment created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error creating assignment' });
    }
};

// @desc    Update assignment
// @route   PUT /api/faculty/assignments/:id
// @access  Private
const updateAssignment = async (req, res) => {
    try {
        const { title, description, due_date, max_marks } = req.body;
        // Store relative path instead of absolute path
        const file_path = req.file ? `uploads/${req.file.filename}` : null;
        
        if (file_path) {
            await db.query(`
                UPDATE assignments 
                SET title = ?, description = ?, file_path = ?, due_date = ?, max_marks = ?
                WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
            `, [title, description, file_path, due_date, max_marks, req.params.id, req.user.id]);
        } else {
            await db.query(`
                UPDATE assignments 
                SET title = ?, description = ?, due_date = ?, max_marks = ?
                WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
            `, [title, description, due_date, max_marks, req.params.id, req.user.id]);
        }
        
        res.json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Server error updating assignment' });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/faculty/assignments/:id
// @access  Private
const deleteAssignment = async (req, res) => {
    try {
        await db.query(`
            DELETE FROM assignments 
            WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
        `, [req.params.id, req.user.id]);
        
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Server error deleting assignment' });
    }
};

// @desc    Get assignment submissions for an assignment
// @route   GET /api/faculty/assignments/:id/submissions
// @access  Private
const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        
        // Get assignment details with subject info
        const [assignment] = await db.query(`
            SELECT 
                a.id,
                a.title,
                a.due_date,
                a.max_marks,
                s.id as subject_id,
                s.name as subject_name,
                s.semester,
                c.id as course_id
            FROM assignments a
            JOIN subjects s ON a.subject_id = s.id
            JOIN courses c ON s.course_id = c.id
            WHERE a.id = ? AND a.faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
        `, [assignmentId, req.user.id]);
        
        if (assignment.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        // Get all students enrolled in this subject
        const [students] = await db.query(`
            SELECT 
                s.id,
                s.enrollment_number,
                s.first_name,
                s.last_name,
                u.email,
                COALESCE(asub.status, 'NOT_SUBMITTED') as status,
                asub.submitted_date,
                asub.marks_obtained,
                asub.remarks,
                asub.marked_at
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN assignment_submissions asub ON asub.student_id = s.id AND asub.assignment_id = ?
            WHERE s.course_id = ? 
            AND s.current_semester = ?
            AND s.status = 'ACTIVE'
            ORDER BY s.enrollment_number
        `, [assignmentId, assignment[0].course_id, assignment[0].semester]);
        
        res.json({
            assignment: assignment[0],
            submissions: students
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Server error fetching submissions' });
    }
};

// @desc    Update submission status (mark as submitted/not submitted)
// @route   POST /api/faculty/assignments/:id/submissions
// @access  Private
const updateSubmissionStatus = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const { student_id, status, submitted_date, marks_obtained, remarks } = req.body;
        
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        // Check if submission record exists
        const [existing] = await db.query(
            'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
            [assignmentId, student_id]
        );
        
        if (existing.length > 0) {
            // Update existing record
            await db.query(`
                UPDATE assignment_submissions 
                SET status = ?, 
                    submitted_date = ?, 
                    marks_obtained = ?, 
                    remarks = ?,
                    marked_by = ?,
                    marked_at = CURRENT_TIMESTAMP
                WHERE assignment_id = ? AND student_id = ?
            `, [status, submitted_date, marks_obtained, remarks, faculty[0].id, assignmentId, student_id]);
        } else {
            // Insert new record
            await db.query(`
                INSERT INTO assignment_submissions 
                (assignment_id, student_id, status, submitted_date, marks_obtained, remarks, marked_by, marked_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [assignmentId, student_id, status, submitted_date, marks_obtained, remarks, faculty[0].id]);
        }
        
        res.json({ message: 'Submission status updated successfully' });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ message: 'Server error updating submission' });
    }
};

// @desc    Bulk update submission status
// @route   POST /api/faculty/assignments/:id/submissions/bulk
// @access  Private
const bulkUpdateSubmissions = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const { submissions } = req.body; // Array of {student_id, status, submitted_date, marks_obtained, remarks}
        
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        // Process each submission
        for (const sub of submissions) {
            const [existing] = await db.query(
                'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
                [assignmentId, sub.student_id]
            );
            
            if (existing.length > 0) {
                await db.query(`
                    UPDATE assignment_submissions 
                    SET status = ?, 
                        submitted_date = ?, 
                        marks_obtained = ?, 
                        remarks = ?,
                        marked_by = ?,
                        marked_at = CURRENT_TIMESTAMP
                    WHERE assignment_id = ? AND student_id = ?
                `, [sub.status, sub.submitted_date, sub.marks_obtained, sub.remarks, faculty[0].id, assignmentId, sub.student_id]);
            } else {
                await db.query(`
                    INSERT INTO assignment_submissions 
                    (assignment_id, student_id, status, submitted_date, marks_obtained, remarks, marked_by, marked_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `, [assignmentId, sub.student_id, sub.status, sub.submitted_date, sub.marks_obtained, sub.remarks, faculty[0].id]);
            }
        }
        
        res.json({ message: 'Submissions updated successfully' });
    } catch (error) {
        console.error('Error bulk updating submissions:', error);
        res.status(500).json({ message: 'Server error updating submissions' });
    }
};

// @desc    Get study materials for faculty's subjects
// @route   GET /api/faculty/study-materials
// @access  Private
const getStudyMaterials = async (req, res) => {
    try {
        const [materials] = await db.query(`
            SELECT 
                sm.id,
                sm.title,
                sm.description,
                sm.file_path,
                sm.file_type,
                sm.file_size,
                sm.topic,
                sm.created_at,
                s.name as subject_name,
                s.code as subject_code,
                s.semester,
                c.name as course_name,
                c.short_code
            FROM study_materials sm
            JOIN subjects s ON sm.subject_id = s.id
            JOIN courses c ON s.course_id = c.id
            WHERE sm.faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
            ORDER BY sm.created_at DESC
        `, [req.user.id]);
        
        res.json(materials);
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ message: 'Server error fetching study materials' });
    }
};

// @desc    Upload study material
// @route   POST /api/faculty/study-materials
// @access  Private
const uploadStudyMaterial = async (req, res) => {
    try {
        const { subject_id, title, description, topic } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const file_path = `uploads/${req.file.filename}`;
        const file_type = req.file.mimetype;
        const file_size = req.file.size;
        
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        const [result] = await db.query(`
            INSERT INTO study_materials (subject_id, faculty_id, title, description, file_path, file_type, file_size, topic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [subject_id, faculty[0].id, title, description, file_path, file_type, file_size, topic]);
        
        res.status(201).json({ message: 'Study material uploaded successfully', id: result.insertId });
    } catch (error) {
        console.error('Error uploading study material:', error);
        res.status(500).json({ message: 'Server error uploading study material' });
    }
};

// @desc    Delete study material
// @route   DELETE /api/faculty/study-materials/:id
// @access  Private
const deleteStudyMaterial = async (req, res) => {
    try {
        await db.query(`
            DELETE FROM study_materials 
            WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
        `, [req.params.id, req.user.id]);
        
        res.json({ message: 'Study material deleted successfully' });
    } catch (error) {
        console.error('Error deleting study material:', error);
        res.status(500).json({ message: 'Server error deleting study material' });
    }
};

// @desc    Get leave applications for faculty
// @desc    Get leave applications for faculty
// @route   GET /api/faculty/leave-applications
// @access  Private
const getLeaveApplications = async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT 
                la.*,
                u.email as reviewed_by_email
            FROM leave_applications la
            LEFT JOIN users u ON la.reviewed_by = u.id
            WHERE la.faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
            ORDER BY la.created_at DESC
        `, [req.user.id]);
        
        res.json(applications);
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({ message: 'Server error fetching leave applications' });
    }
};

// @desc    Apply for leave
// @route   POST /api/faculty/leave-applications
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { leave_type, from_date, to_date, reason } = req.body;
        
        // Calculate total days
        const fromDate = new Date(from_date);
        const toDate = new Date(to_date);
        const total_days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (total_days <= 0) {
            return res.status(400).json({ message: 'Invalid date range' });
        }
        
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        const [result] = await db.query(`
            INSERT INTO leave_applications (faculty_id, leave_type, from_date, to_date, total_days, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [faculty[0].id, leave_type, from_date, to_date, total_days, reason]);
        
        res.status(201).json({ message: 'Leave application submitted successfully', id: result.insertId });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({ message: 'Server error applying for leave' });
    }
};

// @desc    Cancel leave application (only if pending)
// @route   DELETE /api/faculty/leave-applications/:id
// @access  Private
const cancelLeaveApplication = async (req, res) => {
    try {
        // Check if application is pending
        const [application] = await db.query(`
            SELECT status FROM leave_applications 
            WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
        `, [req.params.id, req.user.id]);
        
        if (application.length === 0) {
            return res.status(404).json({ message: 'Leave application not found' });
        }
        
        if (application[0].status !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot cancel approved/rejected application' });
        }
        
        await db.query(`
            DELETE FROM leave_applications 
            WHERE id = ? AND faculty_id = (SELECT id FROM faculty WHERE user_id = ?)
        `, [req.params.id, req.user.id]);
        
        res.json({ message: 'Leave application cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling leave application:', error);
        res.status(500).json({ message: 'Server error cancelling leave application' });
    }
};

module.exports = {
    getDashboard,
    getStudentsBySubject,
    getStudents,
    markAttendance,
    uploadMarks,
    getAttendance,
    getAttendanceHistory,
    getScheduledExams,
    getResults,
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentSubmissions,
    updateSubmissionStatus,
    bulkUpdateSubmissions,
    getStudyMaterials,
    uploadStudyMaterial,
    deleteStudyMaterial,
    getLeaveApplications,
    applyLeave,
    cancelLeaveApplication
};
