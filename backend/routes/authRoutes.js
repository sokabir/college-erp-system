const express = require('express');
const router = express.Router();
const { loginUser, getMe, registerAndApply, setPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/login', loginUser);
router.post('/apply', upload.fields([
    { name: 'document_photo', maxCount: 1 },
    { name: 'document_marksheet', maxCount: 1 },
    { name: 'document_leaving_cert', maxCount: 1 }
]), registerAndApply);
router.post('/set-password', setPassword);
router.get('/me', protect, getMe);

module.exports = router;
