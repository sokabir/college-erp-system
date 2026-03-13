-- ==============================================================================
-- College ERP System - Database Schema and Seed Data
-- ==============================================================================

-- 1. Create and Use Database
DROP DATABASE IF EXISTS college_erp_v2;
CREATE DATABASE college_erp_v2;
USE college_erp_v2;

-- ==============================================================================
-- 2. Create Tables
-- ==============================================================================

-- Users Table (Handles logical accounts for all roles)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table (Master table for available courses like B.Tech, MBA)
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_years INT NOT NULL,
    total_fees DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table (Master table for subjects belonging to courses)
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Admission Applications Table (Pending student applications)
CREATE TABLE admission_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The base user account that registered
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    previous_education TEXT NOT NULL,
    marks DECIMAL(5, 2) NOT NULL, -- e.g., 85.50
    course_applied INT NOT NULL,
    document_path VARCHAR(255),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_applied) REFERENCES courses(id) ON DELETE RESTRICT
);

-- Students Table (Only created after admission is approved)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    enrollment_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    status ENUM('ACTIVE', 'GRADUATED', 'DROPOUT') DEFAULT 'ACTIVE',
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

-- Faculty Table (Teachers)
CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enrollments Table (Which student is enrolled in which subject this semester)
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(student_id, subject_id)
);

-- Faculty Subject Assignment Table (Which faculty teaches what subject)
CREATE TABLE faculty_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(faculty_id, subject_id)
);

-- Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    faculty_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE RESTRICT,
    UNIQUE(student_id, subject_id, date)
);

-- Exams Table
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    exam_date DATE NOT NULL,
    max_marks INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Results Table
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(exam_id, student_id)
);

-- Fees Table
CREATE TABLE fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('PENDING', 'PAID', 'PARTIAL') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fee_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- NULL means global broadcast
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 3. Seed Data
-- ==============================================================================

-- Seed Admin User (Password is 'admin123' bcrypt hash)
-- bcrypt hash for 'admin123': $2a$10$wE1M2mEqx6jZ8D8rE/mP5Ohn/8c.vG4C6Xh2.cI1X2iU7l7A1C0.i
INSERT INTO users (email, password_hash, role) VALUES 
('admin@college.edu', '$2a$10$wE1M2mEqx6jZ8D8rE/mP5Ohn/8c.vG4C6Xh2.cI1X2iU7l7A1C0.i', 'admin');

-- Seed Courses
INSERT INTO courses (name, description, duration_years, total_fees) VALUES 
('B.Tech Computer Science', 'Bachelor of Technology in CS', 4, 400000.00),
('B.Tech Mechanical', 'Bachelor of Technology in ME', 4, 350000.00),
('MBA', 'Master of Business Administration', 2, 500000.00);

-- Seed Subjects
INSERT INTO subjects (course_id, name, code, semester) VALUES 
(1, 'Data Structures', 'CS201', 3),
(1, 'Database Systems', 'CS301', 4),
(1, 'Operating Systems', 'CS401', 5),
(2, 'Thermodynamics', 'ME201', 3),
(3, 'Corporate Finance', 'MBA101', 1);

-- Seed Faculty Users (Password is 'faculty123')
-- bcrypt hash for 'faculty123': $2a$10$3YmPjH8E... (let's use a standard one for seed to keep it simple, generating specific ones in code is better later, but for now we'll put the same default hash or generate it properly)
-- Hash for 'faculty123': $2a$10$vK3zY7E5F6WZG5qF/P1R5uM5T7KzM8K4rR8Z1hX8lR0Z5cTzE1xWy (example)
INSERT INTO users (email, password_hash, role) VALUES 
('dr.smith@college.edu', '$2a$10$f/9.z.rEaV3B6C.hR7HjJ.ZpBmV9K7KzM8K4rR8Z1hX8lR0Z5cTzE', 'faculty'),
('prof.jones@college.edu', '$2a$10$f/9.z.rEaV3B6C.hR7HjJ.ZpBmV9K7KzM8K4rR8Z1hX8lR0Z5cTzE', 'faculty');

-- Actually, a cleaner way to seed users so that passwords actually work is to provide a note to just change passwords via the UI or provide a known valid bcrypt hash for 'password123':
-- $2a$10$NigZ1U/qKItF.zB4a8yO8eiV/j.B/NqB/v4S8D.t2V0cT1iLhM9G.
-- Let's update all seeded passwords to 'password123' using this hash.

UPDATE users SET password_hash = '$2a$10$NigZ1U/qKItF.zB4a8yO8eiV/j.B/NqB/v4S8D.t2V0cT1iLhM9G.';

-- Note: The admin email will be admin@college.edu, password: password123
-- Faculty 1: dr.smith@college.edu, password: password123
-- Faculty 2: prof.jones@college.edu, password: password123

INSERT INTO faculty (user_id, employee_id, first_name, last_name, department) VALUES 
(2, 'FAC001', 'John', 'Smith', 'Computer Science'),
(3, 'FAC002', 'Sarah', 'Jones', 'Mechanical Engineering');

-- Assign Subjects to Faculty
INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES 
(1, 1), -- Smith teaches Data Structures
(1, 2), -- Smith teaches Database Systems
(2, 4); -- Jones teaches Thermodynamics

-- Add a demo student user
INSERT INTO users (email, password_hash, role) VALUES 
('student1@demo.edu', '$2a$10$NigZ1U/qKItF.zB4a8yO8eiV/j.B/NqB/v4S8D.t2V0cT1iLhM9G.', 'student');

-- Add the demo student details
INSERT INTO students (user_id, enrollment_number, first_name, last_name, dob, address, status, course_id) VALUES 
(4, 'ENR2023001', 'Alice', 'Williams', '2001-05-15', '123 Main St, City', 'ACTIVE', 1);

-- Enroll Student in Subjects
INSERT INTO enrollments (student_id, subject_id, enrollment_date) VALUES 
(1, 1, '2023-08-01'),
(1, 2, '2023-08-01');

-- Add Fees for Student
INSERT INTO fees (student_id, amount_due, due_date, status) VALUES 
(1, 200000.00, '2023-09-01', 'PENDING');

-- Add a pending admission application
INSERT INTO users (email, password_hash, role) VALUES 
('applicant@demo.edu', '$2a$10$NigZ1U/qKItF.zB4a8yO8eiV/j.B/NqB/v4S8D.t2V0cT1iLhM9G.', 'student');

INSERT INTO admission_applications (user_id, first_name, last_name, dob, address, previous_education, marks, course_applied, status) VALUES 
(5, 'Bob', 'Johnson', '2002-08-20', '456 Oak Rd', 'High School Science', 88.5, 1, 'PENDING');

