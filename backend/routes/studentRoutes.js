const express = require('express');
const router = express.Router();
const { applyAdmission, getProfile, getFees, getFeeComponents, getPaymentHistory, processComponentPayment, getCourses, getResults, getStudyMaterials, getDashboardStats, getAssignments, getExamTimetable } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.get('/courses', getCourses); // Publicish, but we can protect it

router.use(protect);
router.use(roleCheck(['student']));

const upload = require('../middleware/uploadMiddleware');

router.post('/admission', upload.fields([
    { name: 'document_photo', maxCount: 1 },
    { name: 'document_marksheet', maxCount: 1 },
    { name: 'document_leaving_cert', maxCount: 1 }
]), applyAdmission);
router.get('/profile', getProfile);
router.get('/dashboard-stats', getDashboardStats);
router.get('/assignments', getAssignments);
router.get('/exam-timetable', getExamTimetable);
router.get('/fees', getFees);
router.get('/fee-components', getFeeComponents);
router.get('/payment-history', getPaymentHistory);
router.post('/process-component-payment', processComponentPayment);
// Old payment routes disabled
// router.post('/fees/:id/pay', payFee);
// router.post('/fees/:id/create-order', createFeeOrder);
// router.post('/fees/:id/verify-payment', verifyFeePayment);
router.get('/results', getResults);
router.get('/study-materials', getStudyMaterials);

module.exports = router;
