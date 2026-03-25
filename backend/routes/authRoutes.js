const express = require('express');
const router = express.Router();
const { loginUser, getMe, registerAndApply, setPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/login', loginUser);
router.post('/apply', upload.fields([
    { name: 'document_aadhar', maxCount: 1 },
    { name: 'document_marksheet', maxCount: 1 },
    { name: 'document_leaving', maxCount: 1 },
    { name: 'document_migration', maxCount: 1 },
    { name: 'document_entrance_exam', maxCount: 1 },
    { name: 'document_caste', maxCount: 1 },
    { name: 'document_address_proof', maxCount: 1 },
    { name: 'document_birth_certificate', maxCount: 1 },
    { name: 'document_income_cert', maxCount: 1 },
    { name: 'document_gap_cert', maxCount: 1 }
]), registerAndApply);
router.post('/set-password', setPassword);
router.get('/me', protect, getMe);

module.exports = router;
