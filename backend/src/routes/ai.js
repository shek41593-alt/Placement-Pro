const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticate = require('../middleware/auth');

router.post('/career-advice', authenticate, aiController.analyzeCareer);

module.exports = router;
