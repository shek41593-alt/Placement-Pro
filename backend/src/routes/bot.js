const express = require('express');
const router = express.Router();
const { chat, getChatHistory, getFAQs, addFAQ, deleteFAQ } = require('../controllers/botController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/chat', authenticate, chat);
router.get('/history', authenticate, getChatHistory);
router.get('/faqs', authenticate, getFAQs);
router.post('/faqs', authenticate, authorize('tpo'), addFAQ);
router.delete('/faqs/:id', authenticate, authorize('tpo'), deleteFAQ);

module.exports = router;
