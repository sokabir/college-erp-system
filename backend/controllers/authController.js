const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', email);
        console.log('Password provided:', password ? 'Yes' : 'No');

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const trimmedEmail = email.trim();
        console.log('Trimmed email:', trimmedEmail);
        
        console.log('Querying database for user...');
        const user = await User.findByEmail(trimmedEmail);
        console.log('User found:', user ? 'Yes' : 'No');

        if (user) {
            console.log('User details:', { id: user.id, email: user.email, role: user.role });
            console.log('Comparing passwords...');
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            console.log('Password match:', passwordMatch);

            if (passwordMatch) {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || 'supersecret_jwt_key_here',
                    { expiresIn: '30d' }
                );

                console.log('Login successful');
                res.json({
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    token
                });
            } else {
                console.log('Password mismatch');
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            console.log('User not found');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('=== LOGIN ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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

        // 4. Create Admission Application (user_id will be set when admin approves)
        // First, create a temporary user account
        const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const [userResult] = await connection.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, dummyHash, 'student']
        );
        const tempUserId = userResult.insertId;

        // Now create the admission application linked to this user
        await connection.query(
            `INSERT INTO admission_applications 
            (user_id, email, first_name, last_name, dob, mobile_number, gender, nationality, category,
             address, city, district, state, pin_code,
             guardian_name, guardian_number, guardian_relation,
             previous_education, qualification_level, board_university, school_college_name, year_of_passing, marks, course_applied, 
             document_aadhar, document_marksheet, document_leaving, document_migration, document_entrance_exam,
             document_caste, document_address_proof, document_birth_certificate, document_income_cert, document_gap_cert, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                tempUserId, email, first_name, last_name, dob, mobile_number, gender, nationality, category,
                address, city, district, state, pin_code,
                guardian_name, guardian_number, guardian_relation,
                qualification_level, qualification_level, board_university, school_college_name, year_of_passing, percentage_cgpa, course_applied,
                document_aadhar, document_marksheet, document_leaving, document_migration, document_entrance_exam,
                document_caste, document_address_proof, document_birth_certificate, document_income_cert, document_gap_cert
            ]
        );

        res.status(201).json({ message: 'Application submitted successfully pending review' });
    } catch (error) {
        console.error('=== ADMISSION APPLICATION ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL:', error.sql);
        res.status(500).json({ message: 'Server error during application submission', error: error.message });
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
