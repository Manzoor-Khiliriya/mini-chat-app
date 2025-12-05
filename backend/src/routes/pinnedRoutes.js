const express = require('express');
const router = express.Router();
const pinnedController = require('../controllers/pinnedController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, pinnedController.pinMessage);
router.get('/:channelId', auth, pinnedController.getPinnedMessages);

module.exports = router;
