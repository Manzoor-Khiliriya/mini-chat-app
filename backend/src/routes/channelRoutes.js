const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, channelController.listChannels);
router.post('/', auth, channelController.createChannel);
router.get('/:id', auth, channelController.getChannelDetails);

// user join/request
router.post('/:id/join', auth, channelController.requestJoinChannel);

// leave
router.post('/:id/leave', auth, channelController.leaveChannel);

// owner endpoints
router.get('/:id/requests', auth, channelController.listJoinRequests);
router.post('/requests/:requestId/approve', auth, channelController.approveJoinRequest);
router.post('/requests/:requestId/reject', auth, channelController.rejectJoinRequest);

module.exports = router;
