const express = require('express');
const router = express.Router();
const { getReferrals, createReferral, updateReferral, deleteReferral, getMentorshipSlots, createMentorshipSlot, bookMentorshipSlot, getMyMentorshipSlots, deleteSlot } = require('../controllers/alumniController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/referrals', authenticate, getReferrals);
router.post('/referrals', authenticate, authorize('alumni'), createReferral);
router.put('/referrals/:id', authenticate, authorize('alumni'), updateReferral);
router.delete('/referrals/:id', authenticate, authorize('alumni'), deleteReferral);
router.get('/mentorship', authenticate, getMentorshipSlots);
router.post('/mentorship', authenticate, authorize('alumni'), createMentorshipSlot);
router.post('/mentorship/:id/book', authenticate, authorize('student'), bookMentorshipSlot);
router.get('/mentorship/my', authenticate, getMyMentorshipSlots);
router.delete('/mentorship/:id', authenticate, authorize('alumni'), deleteSlot);

module.exports = router;
