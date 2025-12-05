const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

router.get('/:id', auth, messageController.getMessages);
router.post('/:id/mark-read', auth, messageController.markRead);

module.exports = router;
