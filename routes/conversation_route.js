const express = require('express');
const router = express.Router();
const convService = require('../services/conversation_services');
const auth = require('../services/auth_services'); 
const allow_to = require('../middelware/allow_to');

router.post('/', auth.protect, allow_to('user'), convService.create_conversation);
router.get('/', auth.protect, allow_to('user'), convService.get_user_conversations);
router.get('/:id', auth.protect, allow_to('user'), convService.get_conversation);
router.delete('/:id', auth.protect, allow_to('user'), convService.delete_conversation);
router.post('/:id/leave', auth.protect, allow_to('user'), convService.leave_conversation);

module.exports = router;