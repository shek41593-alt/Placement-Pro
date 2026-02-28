const express = require('express');
const router = express.Router();
const { getAllDrives, getEligibleDrives, getDriveById, createDrive, updateDrive, deleteDrive, notifyEligible, previewEligible, getUnappliedEligibleCount } = require('../controllers/drivesController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', authenticate, getAllDrives);
router.get('/eligible', authenticate, authorize('student'), getEligibleDrives);
router.get('/eligible-count', authenticate, authorize('student'), getUnappliedEligibleCount);
router.get('/:id', authenticate, getDriveById);
router.post('/', authenticate, authorize('tpo'), createDrive);
router.put('/:id', authenticate, authorize('tpo'), updateDrive);
router.delete('/:id', authenticate, authorize('tpo'), deleteDrive);
router.post('/:id/notify', authenticate, authorize('tpo'), notifyEligible);
router.post('/preview-eligible', authenticate, authorize('tpo'), previewEligible);

module.exports = router;
