const express = require('express');
const router = express.Router();
const { getDashboard, getStudentsBySubject, getStudents, markAttendance, getAttendance, getAttendanceHistory, uploadMarks, getScheduledExams, getResults, getAssignments, createAssignment, updateAssignment, deleteAssignment, getAssignmentSubmissions, updateSubmissionStatus, bulkUpdateSubmissions, getStudyMaterials, uploadStudyMaterial, deleteStudyMaterial, getLeaveApplications, applyLeave, cancelLeaveApplication } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(roleCheck(['faculty']));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.get('/subject/:subjectId/students', getStudentsBySubject);
router.post('/attendance', markAttendance);
router.get('/attendance/:subjectId/:date', getAttendance);
router.get('/attendance-history/:subjectId', getAttendanceHistory);
router.get('/scheduled-exams', getScheduledExams);
router.post('/marks', uploadMarks);
router.get('/results', getResults);
router.get('/assignments', getAssignments);
router.post('/assignments', upload.single('file'), createAssignment);
router.put('/assignments/:id', upload.single('file'), updateAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/assignments/:id/submissions', getAssignmentSubmissions);
router.post('/assignments/:id/submissions', updateSubmissionStatus);
router.post('/assignments/:id/submissions/bulk', bulkUpdateSubmissions);
router.get('/study-materials', getStudyMaterials);
router.post('/study-materials', upload.single('file'), uploadStudyMaterial);
router.delete('/study-materials/:id', deleteStudyMaterial);
router.get('/leave-applications', getLeaveApplications);
router.post('/leave-applications', applyLeave);
router.delete('/leave-applications/:id', cancelLeaveApplication);

module.exports = router;
