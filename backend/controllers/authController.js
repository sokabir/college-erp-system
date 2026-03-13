const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const trimmedEmail = email.trim();
        const user = await User.findByEmail(trimmedEmail);

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'supersecret_jwt_key_here',
                { expiresIn: '30d' }
            );

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register new student and apply for admission
// @route   POST /api/auth/apply
// @access  Public
const registerAndApply = async (req, res) => {
    // We need db connection for transactions
    const db = require('../config/db');
    const connection = await db.getConnection();

    try {
        const {
            first_name, last_name, dob, email, mobile_number, gender, nationality, category,
            address, city, district, state, pin_code,
            guardian_name, guardian_number, guardian_relation,
            qualification_level, board_university, school_college_name, year_of_passing, percentage_cgpa,
            course_applied
        } = req.body;

        if (!email || !first_name || !last_name || !mobile_number) {
            return res.status(400).json({ message: 'Missing essential required fields (Email, Name, Mobile Number)' });
        }

        // 1. Check if user exists to prevent crashes during admin approval
        const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Users are created ONLY when admin approves the application

        // 3. Process file uploads
        const getFilePath = (fieldName) => {
            if (req.files && req.files[fieldName] && req.files[fieldName].length > 0) {
                return `/uploads/${req.files[fieldName][0].filename}`;
            }
            return null;
        };

        const document_photo = getFilePath('document_photo');
        const document_marksheet = getFilePath('document_marksheet');
        const document_leaving_cert = getFilePath('document_leaving_cert');

        // 4. Create Admission Application (user_id is NULL for now)
        await connection.query(
            `INSERT INTO admission_applications 
            (user_id, email, first_name, last_name, dob, mobile_number, gender, nationality, category,
             address, city, district, state, pin_code,
             guardian_name, guardian_number, guardian_relation,
             previous_education, qualification_level, board_university, school_college_name, year_of_passing, marks, course_applied, 
             document_photo, document_marksheet, document_leaving_cert, status) 
            VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                email, first_name, last_name, dob, mobile_number, gender, nationality, category,
                address, city, district, state, pin_code,
                guardian_name, guardian_number, guardian_relation,
                qualification_level, qualification_level, board_university, school_college_name, year_of_passing, percentage_cgpa, course_applied,
                document_photo, document_marksheet, document_leaving_cert
            ]
        );

        res.status(201).json({ message: 'Application submitted successfully pending review' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during application submission' });
    } finally {
        connection.release();
    }
};

// @desc    Set new password via token
// @route   POST /api/auth/set-password
// @access  Public
const setPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    const db = require('../config/db');
    const connection = await db.getConnection();

    try {
        // Query user with this token that hasn't expired
        const [users] = await connection.query(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = users[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user: set new password, clear token
        await connection.query(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password has been set successfully. You can now login.' });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ message: 'Server error while setting password' });
    } finally {
        connection.release();
    }
};

module.exports = {
    loginUser,
    getMe,
    registerAndApply,
    setPassword
};
