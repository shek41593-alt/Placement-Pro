const express = require('express');
const router = express.Router();
const { generateResume, downloadResume, getVersionHistory } = require('../controllers/resumeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/generate', authenticate, authorize('student'), generateResume);
router.get('/download/:filename', downloadResume);
router.get('/history', authenticate, authorize('student'), getVersionHistory);

module.exports = router;
