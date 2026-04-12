const AdminModel = require('../models/adminModel');
const FacultyModel = require('../models/facultyModel');
const AdmissionModel = require('../models/admissionModel');
const StudentModel = require('../models/studentModel');
const User = require('../models/userModel');
const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Set up transporter for nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    },
    // Force IPv4 to avoid IPv6 connection issues on Render
    family: 4
});

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const stats = await AdminModel.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
};

// @desc    Get all admission applications (pending, approved, rejected)
// @route   GET /api/admin/admissions
// @access  Private/Admin
const getAllAdmissions = async (req, res) => {
    try {
        const applications = await AdmissionModel.getAllApplications();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve/Reject admission
// @route   POST /api/admin/admissions/:id/decide
// @access  Private/Admin
const decideAdmission = async (req, res) => {
    const { status, admin_comments } = req.body; // 'APPROVED', 'REJECTED', or 'REAPPLY'
    const applicationId = req.params.id;

    if (!['APPROVED', 'REJECTED', 'REAPPLY'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Require comments for REJECTED and REAPPLY
    if ((status === 'REJECTED' || status === 'REAPPLY') && !admin_comments) {
        return res.status(400).json({ message: 'Comments are required for rejection or reapply request' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const application = await AdmissionModel.getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: 'Application already processed' });
        }

        // Update status and comments
        await connection.query(
            'UPDATE admission_applications SET status = ?, admin_comments = ? WHERE id = ?',
            [status, admin_comments || null, applicationId]
        );

        if (status === 'APPROVED') {
            // 1. Generate Token for Password Setup
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date();
            tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

            // 2. Check if user already exists (from application submission)
            let userId;
            if (application.user_id) {
                // User already exists, just update with reset token
                userId = application.user_id;
                await connection.query(
                    'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
                    [resetToken, tokenExpires, userId]
                );
            } else {
                // Create new user account (old applications that don't have user_id)
                const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
                const [userResult] = await connection.query(
                    `INSERT INTO users (email, password_hash, role, reset_password_token, reset_password_expires) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [application.email, dummyHash, 'student', resetToken, tokenExpires]
                );
                userId = userResult.insertId;
                
                // Update Admission Application to link the new user
                await connection.query('UPDATE admission_applications SET user_id = ? WHERE id = ?', [userId, applicationId]);
            }

            // 4. Generate Enrollment Number
            const year = new Date().getFullYear();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const enrollmentNumber = `ENR${year}${randomCode}`;

            // 5. Create Student Record with guardian info (no profile picture initially since passport photo removed)
            const studentData = {
                user_id: userId,
                enrollment_number: enrollmentNumber,
                first_name: application.first_name,
                last_name: application.last_name,
                profile_pic: null, // No profile picture initially - can be added later
                mobile_number: application.mobile_number,
                gender: application.gender,
                dob: application.dob,
                address: application.address,
                guardian_name: application.guardian_name,
                guardian_number: application.guardian_number,
                guardian_relation: application.guardian_relation,
                course_id: application.course_applied
            };

            await StudentModel.create(studentData, connection);

            // 6. Send Email Notification
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const setupLink = `${frontendUrl}/set-password?token=${resetToken}&email=${encodeURIComponent(application.email)}`;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: application.email,
                subject: 'Admission Approved - Action Required: Setup Your Account',
                html: `
                    <h2>Congratulations!</h2>
                    <p>Dear ${application.first_name} ${application.last_name},</p>
                    <p>Your admission application has been approved!</p>
                    <p>To access the student portal, you need to set up your password. Please click the link below to set your password:</p>
                    <p><a href="${setupLink}" target="_blank" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Set up your password</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If the button doesn't work, copy and paste this link into your browser: <br>${setupLink}</p>
                    <p>Best regards,<br>The College Admin Team</p>
                `
            };

            // Send email asynchronously (don't block the response)
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('❌ Error sending admission approval email:', error.message);
                    console.error('   To:', application.email);
                    console.error('   Check email configuration in .env file');
                } else {
                    console.log('✅ Admission approval email sent successfully!');
                    console.log('   To:', application.email);
                    console.log('   Message ID:', info.messageId);
                }
            });
        } else if (status === 'REJECTED') {
            // Send rejection email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: application.email,
                subject: 'Admission Application - Update',
                html: `
                    <h2>Admission Application Status</h2>
                    <p>Dear ${application.first_name} ${application.last_name},</p>
                    <p>Thank you for your interest in our institution. After careful review, we regret to inform you that we are unable to offer you admission at this time.</p>
                    ${admin_comments ? `
                    <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Admin Comments:</strong>
                        <p style="margin: 10px 0 0 0;">${admin_comments}</p>
                    </div>
                    ` : ''}
                    <p>We appreciate your interest and wish you the best in your future endeavors.</p>
                    <p>Best regards,<br>The College Admin Team</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('❌ Error sending rejection email:', error.message);
                    console.error('   To:', application.email);
                } else {
                    console.log('✅ Rejection email sent successfully!');
                    console.log('   To:', application.email);
                    console.log('   Message ID:', info.messageId);
                }
            });
        } else if (status === 'REAPPLY') {
            // Send reapply request email
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const applyLink = `${frontendUrl}/apply`;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: application.email,
                subject: 'Admission Application - Resubmission Required',
                html: `
                    <h2>Admission Application - Action Required</h2>
                    <p>Dear ${application.first_name} ${application.last_name},</p>
                    <p>Thank you for your interest in our institution. We have reviewed your application and found that some information needs to be corrected or updated.</p>
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <strong>Required Changes:</strong>
                        <p style="margin: 10px 0 0 0;">${admin_comments}</p>
                    </div>
                    <p>Please submit a new application with the corrected information:</p>
                    <p><a href="${applyLink}" target="_blank" style="padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px;">Reapply Now</a></p>
                    <p>If the button doesn't work, copy and paste this link into your browser: <br>${applyLink}</p>
                    <p>We look forward to receiving your updated application.</p>
                    <p>Best regards,<br>The College Admin Team</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('❌ Error sending reapply email:', error.message);
                    console.error('   To:', application.email);
                } else {
                    console.log('✅ Reapply request email sent successfully!');
                    console.log('   To:', application.email);
                    console.log('   Message ID:', info.messageId);
                }
            });
        }

        await connection.commit();
        res.json({ message: `Admission ${status.toLowerCase()} successfully` });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error processing admission' });
    } finally {
        connection.release();
    }
};

// @desc    Get all enrolled students
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
    try {
        const students = await StudentModel.getAll();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server Error fetching students' });
    }
};

// @desc    Delete an admission application entirely
// @route   DELETE /api/admin/admissions/:id
// @access  Private/Admin
const deleteAdmission = async (req, res) => {
    const applicationId = req.params.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const application = await AdmissionModel.getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.user_id) {
            // If the application is linked to a user account, deleting the user will cascade
            // and delete the student record and admission application.
            await connection.query('DELETE FROM users WHERE id = ?', [application.user_id]);
        } else {
            // If it's just a pending or rejected application, delete it directly
            await connection.query('DELETE FROM admission_applications WHERE id = ?', [applicationId]);
        }

        await connection.commit();
        res.json({ message: 'Application successfully deleted and email freed.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting admission:', error);
        res.status(500).json({ message: 'Server error deleting admission' });
    } finally {
        connection.release();
    }
};

// @desc    Delete a student entirely (including their user account)
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    const studentId = req.params.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Find the student to get user_id
        const [students] = await connection.query('SELECT user_id FROM students WHERE id = ?', [studentId]);

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const userId = students[0].user_id;

        // Deleting the user will securely cascade to students, attendance, applications, etc.
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.json({ message: 'Student successfully deleted.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error deleting student' });
    } finally {
        connection.release();
    }
};

// @desc    Get all faculty members
// @route   GET /api/admin/faculty
// @access  Private/Admin
const getAllFaculty = async (req, res) => {
    try {
        const [faculty] = await db.query(`
            SELECT f.*, u.email 
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `);
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Server Error fetching faculty' });
    }
};

// @desc    Add a new faculty member (creates user + faculty record)
// @route   POST /api/admin/faculty
// @access  Private/Admin
const addFaculty = async (req, res) => {
    const { first_name, last_name, department, email, mobile_number, gender, dob, address, designation, qualification } = req.body;

    if (!first_name || !last_name || !department || !email) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const profile_pic = req.file ? req.file.filename : null;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if email already exists
        const trimmedEmail = email.trim();
        const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // 2. Generate Token for Password Setup
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

        // 3. Hash dummy password and create User
        const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

        const [userResult] = await connection.query(
            'INSERT INTO users (email, password_hash, role, reset_password_token, reset_password_expires) VALUES (?, ?, ?, ?, ?)',
            [trimmedEmail, dummyHash, 'faculty', resetToken, tokenExpires]
        );
        const newUserId = userResult.insertId;

        // 4. Generate a unique employee ID
        const year = new Date().getFullYear();
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const employeeId = `FAC${year}${randomCode}`;

        // 5. Create Faculty record
        await connection.query(
            `INSERT INTO faculty 
             (user_id, employee_id, first_name, last_name, department, mobile_number, gender, dob, address, profile_pic, designation, qualification) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newUserId, employeeId, first_name, last_name, department, mobile_number || null, gender || null, dob || null, address || null, profile_pic, designation || null, qualification || null]
        );

        // 6. Send Email Notification
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const setupLink = `${frontendUrl}/set-password?token=${resetToken}&email=${encodeURIComponent(trimmedEmail)}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: trimmedEmail,
            subject: 'Faculty Account Created - Setup Your Password',
            html: `
                <h2>Welcome to the Faculty Portal!</h2>
                <p>Dear ${first_name} ${last_name},</p>
                <p>An account has been created for you on the college ERP system.</p>
                <p>Your Employee ID is: <strong>${employeeId}</strong></p>
                <p>To access your account, please set up your password by clicking the link below:</p>
                <p><a href="${setupLink}" target="_blank" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Set up your password</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If the button doesn't work, copy and paste this link into your browser: <br>${setupLink}</p>
                <p>Best regards,<br>The College Admin Team</p>
            `
        };

        // Send email asynchronously (don't block the response)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error sending faculty welcome email:', error.message);
                console.error('   To:', trimmedEmail);
                console.error('   Check email configuration in .env file');
            } else {
                console.log('✅ Faculty welcome email sent successfully!');
                console.log('   To:', trimmedEmail);
                console.log('   Message ID:', info.messageId);
            }
        });

        await connection.commit();
        res.status(201).json({ message: 'Faculty member successfully created' });

    } catch (error) {
        await connection.rollback();
        console.error('Error adding faculty:', error);
        res.status(500).json({ message: 'Server error adding faculty member' });
    } finally {
        connection.release();
    }
};

// @desc    Delete a faculty member
// @route   DELETE /api/admin/faculty/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
    const facultyId = req.params.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Find the faculty to get user_id
        const [faculty] = await connection.query('SELECT user_id FROM faculty WHERE id = ?', [facultyId]);

        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty member not found' });
        }

        const userId = faculty[0].user_id;

        // Deleting the user cascades to delete the faculty record
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.json({ message: 'Faculty member successfully deleted.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting faculty:', error);
        res.status(500).json({ message: 'Server error deleting faculty' });
    } finally {
        connection.release();
    }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAllCourses = async (req, res) => {
    try {
        const [courses] = await db.query(`
            SELECT c.*, 
                   COUNT(DISTINCT s.id) as student_count
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id AND s.status = 'ACTIVE'
            GROUP BY c.id
            ORDER BY c.short_code
        `);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server Error fetching courses' });
    }
};

// @desc    Add a new course
// @route   POST /api/admin/courses
// @access  Private/Admin
const addCourse = async (req, res) => {
    const { name, short_code, description, duration_years, total_fees } = req.body;

    if (!name || !short_code || !duration_years || !total_fees) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        await db.query(
            'INSERT INTO courses (name, short_code, description, duration_years, total_fees) VALUES (?, ?, ?, ?, ?)',
            [name, short_code.toUpperCase(), description, duration_years, total_fees]
        );
        res.status(201).json({ message: 'Course added successfully' });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ message: 'Server error adding course' });
    }
};

// @desc    Delete a course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        // Check if any students are enrolled in this course
        const [students] = await db.query('SELECT COUNT(*) as count FROM students WHERE course_id = ?', [courseId]);
        
        if (students[0].count > 0) {
            return res.status(400).json({ 
                message: `Cannot delete course. ${students[0].count} student(s) are enrolled in this course.` 
            });
        }

        await db.query('DELETE FROM courses WHERE id = ?', [courseId]);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error deleting course' });
    }
};

// @desc    Get subjects for a course
// @route   GET /api/admin/courses/:id/subjects
// @access  Private/Admin
const getCourseSubjects = async (req, res) => {
    const courseId = req.params.id;

    try {
        const [subjects] = await db.query(
            'SELECT * FROM subjects WHERE course_id = ? ORDER BY semester, name',
            [courseId]
        );
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error fetching subjects' });
    }
};

// @desc    Add subject to a course
// @route   POST /api/admin/courses/:id/subjects
// @access  Private/Admin
const addSubject = async (req, res) => {
    const courseId = req.params.id;
    const { name, code, semester } = req.body;

    if (!name || !code || !semester) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if subject code already exists
        const [existing] = await db.query('SELECT id FROM subjects WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Subject code already exists' });
        }

        await db.query(
            'INSERT INTO subjects (course_id, name, code, semester) VALUES (?, ?, ?, ?)',
            [courseId, name, code.toUpperCase(), semester]
        );
        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ message: 'Server error adding subject' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    const subjectId = req.params.id;

    try {
        await db.query('DELETE FROM subjects WHERE id = ?', [subjectId]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server error deleting subject' });
    }
};

// @desc    Get all examinations
// @route   GET /api/admin/examinations
// @access  Private/Admin
const getAllExaminations = async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT 
                es.*,
                COUNT(et.id) as subject_count
            FROM exam_schedules es
            LEFT JOIN exam_timetable et ON es.id = et.exam_schedule_id
            GROUP BY es.id
            ORDER BY es.created_at DESC
        `);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching examinations:', error);
        res.status(500).json({ message: 'Server error fetching examinations' });
    }
};

// @desc    Get exam timetable details
// @route   GET /api/admin/examinations/:id/timetable
// @access  Private/Admin
const getExamTimetable = async (req, res) => {
    try {
        const [timetable] = await db.query(`
            SELECT 
                et.*,
                s.name as subject_name,
                s.code as subject_code,
                c.name as course_name,
                c.short_code
            FROM exam_timetable et
            JOIN subjects s ON et.subject_id = s.id
            JOIN courses c ON s.course_id = c.id
            WHERE et.exam_schedule_id = ?
            ORDER BY et.exam_date, et.exam_time_from
        `, [req.params.id]);
        res.json(timetable);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ message: 'Server error fetching timetable' });
    }
};

// @desc    Create examination schedule
// @route   POST /api/admin/examinations
// @access  Private/Admin
const addExamination = async (req, res) => {
    const { exam_name, semester } = req.body;

    if (!exam_name || !semester) {
        return res.status(400).json({ message: 'Please provide exam name and semester' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO exam_schedules (exam_name, semester, is_published) VALUES (?, ?, FALSE)',
            [exam_name, semester]
        );
        res.status(201).json({ message: 'Exam schedule created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating examination:', error);
        res.status(500).json({ message: 'Server error creating examination' });
    }
};

// @desc    Add subject to exam timetable
// @route   POST /api/admin/examinations/:id/subjects
// @access  Private/Admin
const addExamSubject = async (req, res) => {
    const { subject_id, exam_date, exam_time_from, exam_time_to } = req.body;
    const exam_schedule_id = req.params.id;

    if (!subject_id || !exam_date || !exam_time_from || !exam_time_to) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        await db.query(
            'INSERT INTO exam_timetable (exam_schedule_id, subject_id, exam_date, exam_time_from, exam_time_to) VALUES (?, ?, ?, ?, ?)',
            [exam_schedule_id, subject_id, exam_date, exam_time_from, exam_time_to]
        );
        res.status(201).json({ message: 'Subject added to exam timetable' });
    } catch (error) {
        console.error('Error adding subject to timetable:', error);
        res.status(500).json({ message: 'Server error adding subject' });
    }
};

// @desc    Publish/Unpublish exam schedule
// @route   PUT /api/admin/examinations/:id/publish
// @access  Private/Admin
const publishExamination = async (req, res) => {
    const { is_published } = req.body;
    
    try {
        await db.query('UPDATE exam_schedules SET is_published = ? WHERE id = ?', [is_published, req.params.id]);
        res.json({ message: `Exam ${is_published ? 'published' : 'unpublished'} successfully` });
    } catch (error) {
        console.error('Error publishing examination:', error);
        res.status(500).json({ message: 'Server error publishing examination' });
    }
};

// @desc    Delete examination schedule
// @route   DELETE /api/admin/examinations/:id
// @access  Private/Admin
const deleteExamination = async (req, res) => {
    try {
        await db.query('DELETE FROM exam_schedules WHERE id = ?', [req.params.id]);
        res.json({ message: 'Examination deleted successfully' });
    } catch (error) {
        console.error('Error deleting examination:', error);
        res.status(500).json({ message: 'Server error deleting examination' });
    }
};

// @desc    Delete subject from exam timetable
// @route   DELETE /api/admin/examinations/subjects/:id
// @access  Private/Admin
const deleteExamSubject = async (req, res) => {
    try {
        await db.query('DELETE FROM exam_timetable WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subject removed from timetable' });
    } catch (error) {
        console.error('Error deleting exam subject:', error);
        res.status(500).json({ message: 'Server error deleting subject' });
    }
};

// @desc    Get all events
// @route   GET /api/admin/events
// @access  Private/Admin
const getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events ORDER BY event_date DESC');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
};

// @desc    Add event
// @route   POST /api/admin/events
// @access  Private/Admin
const addEvent = async (req, res) => {
    const { title, description, event_date, type } = req.body;

    if (!title || !description || !event_date || !type) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        await db.query(
            'INSERT INTO events (title, description, event_date, type) VALUES (?, ?, ?, ?)',
            [title, description, event_date, type]
        );
        res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error creating event' });
    }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error deleting event' });
    }
};

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Private/Admin
const getAllNotices = async (req, res) => {
    try {
        const [notices] = await db.query(`
            SELECT n.*, c.name as target_course_name, c.short_code as target_course_code
            FROM notices n
            LEFT JOIN courses c ON n.target_course_id = c.id
            ORDER BY n.created_at DESC
        `);
        res.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ message: 'Server error fetching notices' });
    }
};

// @desc    Add notice
// @route   POST /api/admin/notices
// @access  Private/Admin
const addNotice = async (req, res) => {
    const { title, message, priority, target_audience, target_course_id, target_semester } = req.body;

    if (!title || !message) {
        return res.status(400).json({ message: 'Please provide title and message' });
    }

    try {
        await db.query(
            `INSERT INTO notices (title, message, priority, target_audience, target_course_id, target_semester) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title, 
                message, 
                priority || 'NORMAL',
                target_audience || 'ALL',
                target_course_id || null,
                target_semester || null
            ]
        );
        res.status(201).json({ message: 'Notice published successfully' });
    } catch (error) {
        console.error('Error publishing notice:', error);
        res.status(500).json({ message: 'Server error publishing notice' });
    }
};

// @desc    Delete notice
// @route   DELETE /api/admin/notices/:id
// @access  Private/Admin
const deleteNotice = async (req, res) => {
    try {
        await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error('Error deleting notice:', error);
        res.status(500).json({ message: 'Server error deleting notice' });
    }
};

// @desc    Get faculty class assignments
// @route   GET /api/admin/faculty/:id/classes
// @access  Private/Admin
const getFacultyClasses = async (req, res) => {
    try {
        const [classes] = await db.query(`
            SELECT fc.id, fc.semester, c.id as course_id, c.name as course_name, c.short_code
            FROM faculty_classes fc
            JOIN courses c ON fc.course_id = c.id
            WHERE fc.faculty_id = ?
            ORDER BY c.short_code, fc.semester
        `, [req.params.id]);
        res.json(classes);
    } catch (error) {
        console.error('Error fetching faculty classes:', error);
        res.status(500).json({ message: 'Server error fetching classes' });
    }
};

// @desc    Assign class to faculty
// @route   POST /api/admin/faculty/:id/classes
// @access  Private/Admin
const assignClassToFaculty = async (req, res) => {
    const { course_id, semester } = req.body;
    const faculty_id = req.params.id;

    if (!course_id || !semester) {
        return res.status(400).json({ message: 'Please provide course and semester' });
    }

    try {
        await db.query(
            'INSERT INTO faculty_classes (faculty_id, course_id, semester) VALUES (?, ?, ?)',
            [faculty_id, course_id, semester]
        );
        res.status(201).json({ message: 'Class assigned successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'This class is already assigned to this faculty' });
        }
        console.error('Error assigning class:', error);
        res.status(500).json({ message: 'Server error assigning class' });
    }
};

// @desc    Remove class assignment from faculty
// @route   DELETE /api/admin/faculty/classes/:id
// @access  Private/Admin
const removeClassAssignment = async (req, res) => {
    try {
        await db.query('DELETE FROM faculty_classes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Class assignment removed' });
    } catch (error) {
        console.error('Error removing class assignment:', error);
        res.status(500).json({ message: 'Server error removing assignment' });
    }
};

// Faculty Subject Assignment Functions
getFacultySubjects = async (req, res) => {
    try {
        const [subjects] = await db.query(`
            SELECT fs.id, s.id as subject_id, s.name, s.code, s.semester
            FROM faculty_subjects fs
            JOIN subjects s ON fs.subject_id = s.id
            WHERE fs.faculty_id = ?
            ORDER BY s.semester, s.code
        `, [req.params.id]);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching faculty subjects:', error);
        res.status(500).json({ message: 'Server error fetching subjects' });
    }
}

assignSubjectToFaculty = async (req, res) => {
    const { subject_id } = req.body;
    const faculty_id = req.params.id;

    if (!subject_id) {
        return res.status(400).json({ message: 'Please provide subject' });
    }

    try {
        await db.query(
            'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)',
            [faculty_id, subject_id]
        );
        res.status(201).json({ message: 'Subject assigned successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'This subject is already assigned to this faculty' });
        }
        console.error('Error assigning subject:', error);
        res.status(500).json({ message: 'Server error assigning subject' });
    }
}

removeSubjectAssignment = async (req, res) => {
    try {
        await db.query('DELETE FROM faculty_subjects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subject assignment removed' });
    } catch (error) {
        console.error('Error removing subject assignment:', error);
        res.status(500).json({ message: 'Server error removing assignment' });
    }
}


// @desc    Update course fees
// @route   PUT /api/admin/courses/:id/fees
// @access  Private/Admin
const updateCourseFees = async (req, res) => {
    const { total_fees, tuition_fee, library_fee, lab_fee, exam_fee } = req.body;
    const courseId = req.params.id;

    try {
        // Update all fee components
        await db.query(
            `UPDATE courses 
             SET total_fees = ?, 
                 tuition_fee = ?, 
                 library_fee = ?, 
                 lab_fee = ?, 
                 exam_fee = ? 
             WHERE id = ?`,
            [total_fees, tuition_fee, library_fee, lab_fee, exam_fee, courseId]
        );
        
        res.json({ message: 'Fee structure updated successfully' });
    } catch (error) {
        console.error('Error updating fees:', error);
        res.status(500).json({ message: 'Server error updating fees' });
    }
};

// @desc    Get all student fees
// @route   GET /api/admin/student-fees
// @access  Private/Admin
const getStudentFees = async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT 
                s.id,
                s.enrollment_number,
                s.first_name,
                s.last_name,
                c.name as course_name,
                COALESCE(sfc.tuition_fee, 0) as tuition_fee,
                COALESCE(sfc.tuition_paid, 0) as tuition_paid,
                COALESCE(sfc.library_fee, 0) as library_fee,
                COALESCE(sfc.library_paid, 0) as library_paid,
                COALESCE(sfc.lab_fee, 0) as lab_fee,
                COALESCE(sfc.lab_paid, 0) as lab_paid,
                COALESCE(sfc.exam_fee, 0) as exam_fee,
                COALESCE(sfc.exam_paid, 0) as exam_paid,
                COALESCE(sfc.tuition_fee, 0) + COALESCE(sfc.library_fee, 0) + 
                COALESCE(sfc.lab_fee, 0) + COALESCE(sfc.exam_fee, 0) as total_due,
                COALESCE(sfc.tuition_paid, 0) + COALESCE(sfc.library_paid, 0) + 
                COALESCE(sfc.lab_paid, 0) + COALESCE(sfc.exam_paid, 0) as total_paid,
                COALESCE(sfc.status, 'PENDING') as fee_status,
                sfc.semester,
                sfc.academic_year
            FROM students s
            JOIN courses c ON s.course_id = c.id
            LEFT JOIN student_fee_components sfc ON s.id = sfc.student_id 
                AND sfc.semester = s.current_semester
                AND sfc.academic_year = (
                    SELECT academic_year FROM student_fee_components 
                    WHERE student_id = s.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                )
            WHERE s.status = 'ACTIVE'
            ORDER BY s.enrollment_number
        `);
        res.json(students);
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ message: 'Server error fetching student fees' });
    }
};

// @desc    Promote students to next semester
// @route   POST /api/admin/students/promote
// @access  Private/Admin
const promoteStudents = async (req, res) => {
    const { student_ids, target_semester } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({ message: 'Please provide student IDs' });
    }

    if (!target_semester || target_semester < 1 || target_semester > 6) {
        return res.status(400).json({ message: 'Invalid target semester (must be 1-6)' });
    }

    try {
        const placeholders = student_ids.map(() => '?').join(',');
        await db.query(
            `UPDATE students SET current_semester = ? WHERE id IN (${placeholders})`,
            [target_semester, ...student_ids]
        );
        
        res.json({ 
            message: `Successfully promoted ${student_ids.length} student(s) to Semester ${target_semester}` 
        });
    } catch (error) {
        console.error('Error promoting students:', error);
        res.status(500).json({ message: 'Server error promoting students' });
    }
};

// @desc    Get all faculty leave applications
// @route   GET /api/admin/leave-applications
// @access  Private/Admin
const getAllLeaveApplications = async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT 
                la.*,
                CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
                f.employee_id
            FROM leave_applications la
            JOIN faculty f ON la.faculty_id = f.id
            ORDER BY 
                CASE la.status
                    WHEN 'PENDING' THEN 1
                    WHEN 'APPROVED' THEN 2
                    WHEN 'REJECTED' THEN 3
                END,
                la.created_at DESC
        `);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({ message: 'Server error fetching leave applications' });
    }
};

// @desc    Review leave application (approve/reject)
// @route   POST /api/admin/leave-applications/:id/review
// @access  Private/Admin
const reviewLeaveApplication = async (req, res) => {
    const { status, admin_comments } = req.body;
    const applicationId = req.params.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'REJECTED' && !admin_comments) {
        return res.status(400).json({ message: 'Comments are required for rejection' });
    }

    try {
        await db.query(
            `UPDATE leave_applications 
             SET status = ?, admin_remarks = ?, reviewed_by = ?, reviewed_at = NOW()
             WHERE id = ?`,
            [status, admin_comments || null, req.user.id, applicationId]
        );

        res.json({ message: `Leave application ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error('Error reviewing leave application:', error);
        res.status(500).json({ message: 'Server error reviewing leave application' });
    }
};

// @desc    Get payment history
// @route   GET /api/admin/payment-history
// @access  Private/Admin
const getPaymentHistory = async (req, res) => {
    try {
        const [payments] = await db.query(`
            SELECT 
                cp.id,
                cp.transaction_id,
                cp.amount_paid,
                cp.payment_date,
                cp.payment_method,
                cp.component_type,
                s.enrollment_number,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                c.name as course_name,
                sfc.semester,
                sfc.academic_year
            FROM component_payments cp
            JOIN students s ON cp.student_id = s.id
            JOIN courses c ON s.course_id = c.id
            JOIN student_fee_components sfc ON cp.fee_component_id = sfc.id
            WHERE cp.payment_status = 'SUCCESS'
            ORDER BY cp.payment_date DESC, cp.id DESC
        `);
        
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Server error fetching payment history' });
    }
};

// @desc    Record cash payment for student
// @route   POST /api/admin/record-cash-payment
// @access  Private/Admin
const recordCashPayment = async (req, res) => {
    const { student_id, tuition_fee, library_fee, lab_fee, exam_fee, payment_date, receipt_number, notes, total_amount } = req.body;

    if (!student_id || !payment_date) {
        return res.status(400).json({ message: 'Student ID and payment date are required' });
    }

    if (!total_amount || total_amount <= 0) {
        return res.status(400).json({ message: 'Total payment amount must be greater than 0' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get student's current fee component record
        const [feeRecords] = await connection.query(`
            SELECT * FROM student_fee_components
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [student_id]);

        if (feeRecords.length === 0) {
            return res.status(404).json({ message: 'Student fee record not found' });
        }

        const feeRecord = feeRecords[0];
        const transactionId = receipt_number || `CASH-${Date.now()}`;

        // Record each component payment if amount > 0
        const components = [
            { type: 'tuition', amount: parseFloat(tuition_fee || 0) },
            { type: 'library', amount: parseFloat(library_fee || 0) },
            { type: 'lab', amount: parseFloat(lab_fee || 0) },
            { type: 'exam', amount: parseFloat(exam_fee || 0) }
        ];

        for (const component of components) {
            if (component.amount > 0) {
                // Insert payment record
                await connection.query(`
                    INSERT INTO component_payments 
                    (fee_component_id, student_id, component_type, amount_paid, payment_method, transaction_id, payment_status, payment_date)
                    VALUES (?, ?, ?, ?, 'CASH', ?, 'SUCCESS', ?)
                `, [
                    feeRecord.id,
                    student_id,
                    component.type,
                    component.amount,
                    transactionId,
                    payment_date
                ]);

                // Update fee component paid amount
                const paidColumn = `${component.type}_paid`;
                await connection.query(`
                    UPDATE student_fee_components
                    SET ${paidColumn} = ${paidColumn} + ?
                    WHERE id = ?
                `, [component.amount, feeRecord.id]);
            }
        }

        // Update overall status
        const [updated] = await connection.query('SELECT * FROM student_fee_components WHERE id = ?', [feeRecord.id]);
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

        await connection.query('UPDATE student_fee_components SET status = ? WHERE id = ?', [status, feeRecord.id]);

        await connection.commit();

        res.json({
            message: 'Cash payment recorded successfully',
            transaction_id: transactionId,
            status: status,
            total_amount: total_amount
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error recording cash payment:', error);
        res.status(500).json({ message: 'Server error recording cash payment' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getDashboardStats,
    getAllAdmissions,
    decideAdmission,
    getAllStudents,
    deleteAdmission,
    deleteStudent,
    getAllFaculty,
    addFaculty,
    deleteFaculty,
    getFacultyClasses,
    assignClassToFaculty,
    removeClassAssignment,
    getFacultySubjects,
    assignSubjectToFaculty,
    removeSubjectAssignment,
    getAllCourses,
    addCourse,
    deleteCourse,
    getCourseSubjects,
    addSubject,
    deleteSubject,
    getAllExaminations,
    getExamTimetable,
    addExamination,
    addExamSubject,
    publishExamination,
    deleteExamination,
    deleteExamSubject,
    getAllEvents,
    addEvent,
    deleteEvent,
    getAllNotices,
    addNotice,
    deleteNotice,
    getAllLeaveApplications,
    reviewLeaveApplication,
    updateCourseFees,
    getStudentFees,
    promoteStudents,
    getPaymentHistory,
    recordCashPayment
};
