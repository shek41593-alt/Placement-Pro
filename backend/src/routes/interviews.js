const express = require('express');
const router = express.Router();
const { getSlots, createSlot, updateSlot, deleteSlot, getMySlots } = require('../controllers/interviewsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', authenticate, getSlots);
router.get('/my', authenticate, authorize('student'), getMySlots);
router.post('/', authenticate, authorize('tpo'), createSlot);
router.put('/:id', authenticate, authorize('tpo'), updateSlot);
router.delete('/:id', authenticate, authorize('tpo'), deleteSlot);

module.exports = router;
