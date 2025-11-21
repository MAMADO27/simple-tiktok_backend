const express = require('express');
const router = express.Router();
const message_services = require('../services/message_services');
const auth_services = require('../services/auth_services');

router.post('/', auth_services.protect, message_services.create_message);
router.get('/:conversationId', auth_services.protect, message_services.get_messages);
router.post('/mark-read', auth_services.protect, message_services.mark_read);
router.get('/:conversationId/unread-count', auth_services.protect, message_services.get_unread_count);
router.delete('/:id', auth_services.protect, message_services.delete_message);

module.exports = router;