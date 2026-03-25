const express = require('express');
const router = express.Router();
const { 
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
    updateCourseFees,
    getStudentFees,
    getPaymentHistory,
    promoteStudents,
    getAllLeaveApplications,
    reviewLeaveApplication,
    recordCashPayment
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(roleCheck(['admin']));

router.get('/dashboard', getDashboardStats);
router.get('/admissions', getAllAdmissions);
router.post('/admissions/:id/decide', decideAdmission);
router.delete('/admissions/:id', deleteAdmission);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.get('/faculty', getAllFaculty);
router.post('/faculty', upload.single('profile_pic'), addFaculty);
router.delete('/faculty/:id', deleteFaculty);
router.get('/faculty/:id/classes', getFacultyClasses);
router.post('/faculty/:id/classes', assignClassToFaculty);
router.delete('/faculty/classes/:id', removeClassAssignment);
router.get('/faculty/:id/subjects', getFacultySubjects);
router.post('/faculty/:id/subjects', assignSubjectToFaculty);
router.delete('/faculty/subjects/:id', removeSubjectAssignment);

// Course management routes
router.get('/courses', getAllCourses);
router.post('/courses', addCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/courses/:id/subjects', getCourseSubjects);
router.post('/courses/:id/subjects', addSubject);
router.delete('/subjects/:id', deleteSubject);

// Examination routes
router.get('/examinations', getAllExaminations);
router.get('/examinations/:id/timetable', getExamTimetable);
router.post('/examinations', addExamination);
router.post('/examinations/:id/subjects', addExamSubject);
router.put('/examinations/:id/publish', publishExamination);
router.delete('/examinations/:id', deleteExamination);
router.delete('/examinations/subjects/:id', deleteExamSubject);

// Event routes
router.get('/events', getAllEvents);
router.post('/events', addEvent);
router.delete('/events/:id', deleteEvent);

// Notice routes
router.get('/notices', getAllNotices);
router.post('/notices', addNotice);
router.delete('/notices/:id', deleteNotice);

// Finance routes
router.put('/courses/:id/fees', updateCourseFees);
router.get('/student-fees', getStudentFees);
router.get('/payment-history', getPaymentHistory);
router.post('/record-cash-payment', recordCashPayment);

// Student promotion route
router.post('/students/promote', promoteStudents);

// Leave management routes
router.get('/leave-applications', getAllLeaveApplications);
router.post('/leave-applications/:id/review', reviewLeaveApplication);

module.exports = router;
