const express = require('express');
const router = express.Router();
const { applyToDrive, getMyApplications, getAllApplications, updateStatus, getStats } = require('../controllers/applicationsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/apply', authenticate, authorize('student'), applyToDrive);
router.get('/my', authenticate, authorize('student'), getMyApplications);
router.get('/all', authenticate, authorize('tpo'), getAllApplications);
router.patch('/:id/status', authenticate, authorize('tpo'), updateStatus);
router.get('/stats', authenticate, authorize('tpo'), getStats);

module.exports = router;
