const StudentModel = require('../models/studentModel');
const CourseModel = require('../models/courseModel');
const FeeModel = require('../models/feeModel');
const AdmissionModel = require('../models/admissionModel');
const db = require('../config/db');

// @desc    Apply for admission
// @route   POST /api/student/admission
// @access  Private (Role: student)
const applyAdmission = async (req, res) => {
    try {
        const {
            first_name, last_name, dob, email, mobile_number, gender, nationality, category,
            address, city, district, state, pin_code,
            guardian_name, guardian_number, guardian_relation,
            qualification_level, board_university, school_college_name, year_of_passing, percentage_cgpa,
            course_applied
        } = req.body;

        const user_id = req.user.id; // User must be logged in to apply

        // Get file paths for all documents
        const getFilePath = (fieldName) => {
            if (req.files && req.files[fieldName] && req.files[fieldName].length > 0) {
                return `/uploads/${req.files[fieldName][0].filename}`;
            }
            return null;
        };

        const document_aadhar = getFilePath('document_aadhar');
        const document_marksheet = getFilePath('document_marksheet');
        const document_leaving = getFilePath('document_leaving');
        const document_migration = getFilePath('document_migration');
        const document_entrance_exam = getFilePath('document_entrance_exam');
        const document_caste = getFilePath('document_caste');
        const document_address_proof = getFilePath('document_address_proof');
        const document_birth_certificate = getFilePath('document_birth_certificate');
        const document_income_cert = getFilePath('document_income_cert');
        const document_gap_cert = getFilePath('document_gap_cert');

        const [result] = await db.query(
            `INSERT INTO admission_applications 
            (user_id, first_name, last_name, dob, mobile_number, gender, nationality, category,
             address, city, district, state, pin_code,
             guardian_name, guardian_number, guardian_relation,
             qualification_level, board_university, school_college_name, year_of_passing, marks, course_applied, 
             document_aadhar, document_marksheet, document_leaving, document_migration, document_entrance_exam,
             document_caste, document_address_proof, document_birth_certificate, document_income_cert, document_gap_cert, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                user_id, first_name, last_name, dob, mobile_number, gender, nationality, category,
                address, city, district, state, pin_code,
                guardian_name, guardian_number, guardian_relation,
                qualification_level, board_university, school_college_name, year_of_passing, percentage_cgpa, course_applied,
                document_aadhar, document_marksheet, document_leaving, document_migration, document_entrance_exam,
                document_caste, document_address_proof, document_birth_certificate, document_income_cert, document_gap_cert
            ]
        );

        res.status(201).json({ message: 'Admission application submitted successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during application' });
    }
};

// @desc    Get student profile (if approved)
// @route   GET /api/student/profile
// @access  Private (Role: student)
const getProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [rows] = await db.query(`
            SELECT s.*, c.name as course_name 
            FROM students s 
            JOIN courses c ON s.course_id = c.id 
            WHERE s.user_id = ? `, [user_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student profile not found. Admission may still be pending.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get fees and mock payment
// @route   GET /api/student/fees
// @route   POST /api/student/fees/:id/pay
// @access  Private
const getFees = async (req, res) => {
    try {
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) return res.status(404).json({ message: 'Student record not found' });

        const fees = await FeeModel.getByStudentId(studentRows[0].id);
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Payment functionality disabled - students should contact administration for fee payments
// const payFee = async (req, res) => {
//     res.status(403).json({ message: 'Online payment is currently disabled. Please contact administration.' });
// };

// const createFeeOrder = async (req, res) => {
//     res.status(403).json({ message: 'Online payment is currently disabled. Please contact administration.' });
// };

// const verifyFeePayment = async (req, res) => {
//     res.status(403).json({ message: 'Online payment is currently disabled. Please contact administration.' });
// };

// @desc    Get student fee components
// @route   GET /api/student/fee-components
// @access  Private
const getFeeComponents = async (req, res) => {
    try {
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const [components] = await db.query(`
            SELECT * FROM student_fee_components
            WHERE student_id = ?
            ORDER BY academic_year DESC, semester DESC
        `, [studentRows[0].id]);

        res.json(components);
    } catch (error) {
        console.error('Error fetching fee components:', error);
        res.status(500).json({ message: 'Server error fetching fee components' });
    }
};

// @desc    Get student payment history
// @route   GET /api/student/payment-history
// @access  Private
const getPaymentHistory = async (req, res) => {
    try {
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const [payments] = await db.query(`
            SELECT 
                cp.*,
                sfc.semester,
                sfc.academic_year
            FROM component_payments cp
            JOIN student_fee_components sfc ON cp.fee_component_id = sfc.id
            WHERE cp.student_id = ? AND cp.payment_status = 'SUCCESS'
            ORDER BY cp.payment_date DESC
        `, [studentRows[0].id]);

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Server error fetching payment history' });
    }
};

// @desc    Process component-based payment
// @route   POST /api/student/process-component-payment
// @access  Private
const processComponentPayment = async (req, res) => {
    try {
        const { components, payment_method, payment_details } = req.body;
        
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const studentId = studentRows[0].id;

        // Get current fee component record
        const [feeRecords] = await db.query(`
            SELECT * FROM student_fee_components
            WHERE student_id = ?
            ORDER BY academic_year DESC, semester DESC
            LIMIT 1
        `, [studentId]);

        if (feeRecords.length === 0) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        const feeRecord = feeRecords[0];
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Process each component payment
        for (const [componentType, amount] of Object.entries(components)) {
            if (amount > 0) {
                const paidAmount = parseFloat(amount);
                
                // Insert payment record
                await db.query(`
                    INSERT INTO component_payments 
                    (fee_component_id, student_id, component_type, amount_paid, payment_method, transaction_id, payment_status, card_last4, card_brand, upi_id, bank_name)
                    VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?, ?, ?)
                `, [
                    feeRecord.id,
                    studentId,
                    componentType,
                    paidAmount,
                    payment_method,
                    `${transactionId}_${componentType}`,
                    payment_details.cardNumber ? payment_details.cardNumber.slice(-4) : null,
                    payment_details.cardNumber ? 'VISA' : null,
                    payment_details.upiId || null,
                    payment_details.bankName || payment_details.walletProvider || null
                ]);

                // Update fee component paid amount
                const paidColumn = `${componentType}_paid`;
                await db.query(`
                    UPDATE student_fee_components
                    SET ${paidColumn} = ${paidColumn} + ?
                    WHERE id = ?
                `, [paidAmount, feeRecord.id]);
            }
        }

        // Update overall status
        const [updated] = await db.query('SELECT * FROM student_fee_components WHERE id = ?', [feeRecord.id]);
        const updatedRecord = updated[0];
        
        const totalFee = parseFloat(updatedRecord.tuition_fee) + parseFloat(updatedRecord.library_fee) + 
                        parseFloat(updatedRecord.lab_fee) + parseFloat(updatedRecord.exam_fee);
        const totalPaid = parseFloat(updatedRecord.tuition_paid) + parseFloat(updatedRecord.library_paid) + 
                         parseFloat(updatedRecord.lab_paid) + parseFloat(updatedRecord.exam_paid);

        let status = 'PENDING';
        if (totalPaid >= totalFee) {
            status = 'PAID';
        } else if (totalPaid > 0) {
            status = 'PARTIAL';
        }

        await db.query('UPDATE student_fee_components SET status = ? WHERE id = ?', [status, feeRecord.id]);

        res.json({
            message: 'Payment processed successfully',
            transaction_id: transactionId,
            status: status
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};

// Get Course list for the admission form dropdown
const getCourses = async (req, res) => {
    try {
        // Only show courses with short_code (CM, CE, EE, ME) - exclude old B.Tech/MBA courses
        const [courses] = await db.query('SELECT * FROM courses WHERE short_code IS NOT NULL AND short_code != "" ORDER BY short_code');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student results
// @route   GET /api/student/results
// @access  Private
const getResults = async (req, res) => {
    try {
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) return res.status(404).json({ message: 'Student record not found' });

        const ResultModel = require('../models/resultModel');
        const results = await ResultModel.getStudentResults(studentRows[0].id);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get study materials for student's current semester
// @route   GET /api/student/study-materials
// @access  Private
const getStudyMaterials = async (req, res) => {
    try {
        const [studentRows] = await db.query(`
            SELECT id, course_id, current_semester 
            FROM students 
            WHERE user_id = ?
        `, [req.user.id]);
        
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        const student = studentRows[0];
        
        // Get study materials for student's course and semester
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
                CONCAT(f.first_name, ' ', f.last_name) as faculty_name
            FROM study_materials sm
            JOIN subjects s ON sm.subject_id = s.id
            JOIN faculty f ON sm.faculty_id = f.id
            WHERE s.course_id = ? 
            AND s.semester = ?
            ORDER BY sm.created_at DESC
        `, [student.course_id, student.current_semester]);
        
        res.json(materials);
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ message: 'Server error fetching study materials' });
    }
};

// @desc    Get dashboard stats for student
// @route   GET /api/student/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const [studentRows] = await db.query(`
            SELECT id, course_id, current_semester 
            FROM students 
            WHERE user_id = ?
        `, [req.user.id]);
        
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        const student = studentRows[0];
        
        // Get attendance percentage
        const [attendanceStats] = await db.query(`
            SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_count
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.student_id = ?
            AND s.course_id = ?
            AND s.semester = ?
        `, [student.id, student.course_id, student.current_semester]);
        
        const totalClasses = attendanceStats[0].total_classes || 0;
        const presentCount = attendanceStats[0].present_count || 0;
        const attendance_percentage = totalClasses > 0 
            ? Math.round((presentCount / totalClasses) * 100) 
            : 0;
        
        // Get recent notices
        const [notices] = await db.query(`
            SELECT id, title, message, priority, created_at
            FROM notices
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        // Get upcoming exams for student's course and semester
        const [upcomingExams] = await db.query(`
            SELECT 
                et.id,
                et.exam_date,
                et.exam_time_from,
                et.exam_time_to,
                s.name as subject_name,
                s.code as subject_code,
                es.exam_name
            FROM exam_timetable et
            JOIN exam_schedules es ON et.exam_schedule_id = es.id
            JOIN subjects s ON et.subject_id = s.id
            WHERE s.course_id = ? 
            AND s.semester = ?
            AND es.is_published = TRUE
            AND et.exam_date >= CURRENT_DATE()
            ORDER BY et.exam_date, et.exam_time_from
            LIMIT 5
        `, [student.course_id, student.current_semester]);
        
        // Get upcoming events
        const [upcomingEvents] = await db.query(`
            SELECT id, title, description, event_date, type
            FROM events
            WHERE event_date >= CURRENT_DATE()
            ORDER BY event_date
            LIMIT 5
        `);
        
        res.json({
            attendance_percentage,
            recent_notices: notices,
            upcoming_exams: upcomingExams,
            upcoming_events: upcomingEvents
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};

// @desc    Get assignments for student
// @route   GET /api/student/assignments
// @access  Private
const getAssignments = async (req, res) => {
    try {
        const [studentRows] = await db.query(`
            SELECT id, course_id, current_semester 
            FROM students 
            WHERE user_id = ?
        `, [req.user.id]);
        
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        const student = studentRows[0];
        
        // Get all assignments for student's course and semester with submission status
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
                asub.status as submission_status,
                asub.submitted_date,
                asub.marks_obtained,
                asub.remarks
            FROM assignments a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
            WHERE s.course_id = ?
            AND s.semester = ?
            ORDER BY a.due_date DESC
        `, [student.id, student.course_id, student.current_semester]);
        
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

// @desc    Get exam timetable for student
// @route   GET /api/student/exam-timetable
// @access  Private
const getExamTimetable = async (req, res) => {
    try {
        const [studentRows] = await db.query(`
            SELECT id, course_id, current_semester 
            FROM students 
            WHERE user_id = ?
        `, [req.user.id]);
        
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        const student = studentRows[0];
        
        // Get published exam schedules with timetable for student's course and semester
        const [exams] = await db.query(`
            SELECT 
                es.id as exam_schedule_id,
                es.exam_name,
                es.semester as exam_semester,
                et.id as timetable_id,
                et.exam_date,
                et.exam_time_from,
                et.exam_time_to,
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.semester
            FROM exam_schedules es
            JOIN exam_timetable et ON es.id = et.exam_schedule_id
            JOIN subjects s ON et.subject_id = s.id
            WHERE es.is_published = TRUE
            AND s.course_id = ?
            AND s.semester = ?
            AND et.exam_date >= CURRENT_DATE()
            ORDER BY et.exam_date, et.exam_time_from
        `, [student.course_id, student.current_semester]);
        
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exam timetable:', error);
        res.status(500).json({ message: 'Server error fetching exam timetable' });
    }
};

module.exports = {
    applyAdmission,
    getProfile,
    getFees,
    getFeeComponents,
    getPaymentHistory,
    processComponentPayment,
    // payFee, // Disabled - old payment functionality removed
    // createFeeOrder, // Disabled - old payment functionality removed
    // verifyFeePayment, // Disabled - old payment functionality removed
    getCourses,
    getResults,
    getStudyMaterials,
    getDashboardStats,
    getAssignments,
    getExamTimetable
};
