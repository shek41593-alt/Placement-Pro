const express = require('express');
const router = express.Router();
const { getSkillGap, getPlacementStats, getDashboardStats } = require('../controllers/analyticsController');
const authenticate = require('../middleware/auth');

router.get('/skill-gap', authenticate, getSkillGap);
router.get('/placement-stats', authenticate, getPlacementStats);
router.get('/dashboard', authenticate, getDashboardStats);

module.exports = router;
