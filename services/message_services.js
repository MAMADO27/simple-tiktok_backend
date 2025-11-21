const Message = require('../modules/message_module');
const Conversation = require('../modules/conversation_module');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');

// create message
exports.create_message = asyncHandler(async (req, res) => {
  const { conversationId, text, attachments } = req.body;
  const sender = req.user._id;

  if (!conversationId) throw new api_error('conversationId is required', 400);
  
  //  Validate message content
  if (!text && (!attachments || attachments.length === 0)) {
    throw new api_error('Message must have text or attachments', 400);
  }

  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new api_error('Conversation not found', 404);

  if (!conv.members.some(m => m.toString() === sender.toString())) {
    throw new api_error('You are not a member of this conversation', 403);
  }

  const msg = await Message.create({ 
    conversationId, 
    sender, 
    text, 
    attachments: attachments || [] 
  });
  conv.updatedAt = Date.now();
  await conv.save();
  await msg.populate('sender', 'name profileImg email');

  res.status(201).json({ data: msg });
});

// get messages for conversation
exports.get_messages = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  if (!conversationId) throw new api_error('conversationId is required', 400);

  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new api_error('Conversation not found', 404);
  
  if (!conv.members.some(m => m.toString() === req.user._id.toString())) {
    throw new api_error('Not authorized to access these messages', 403);
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 }) 
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profileImg email');

 
  const total = await Message.countDocuments({ conversationId });

  res.status(200).json({ 
    results: messages.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: messages 
  });
});

// mark message(s) as read
exports.mark_read = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user._id;
  
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw new api_error('messageIds array required', 400);
  }

  // Get messages to check authorization
  const messages = await Message.find({ _id: { $in: messageIds } });
  
  if (messages.length === 0) {
    throw new api_error('No messages found', 404);
  }

  // Check authorization
  const convIds = [...new Set(messages.map(m => m.conversationId.toString()))];
  const conversations = await Conversation.find({ _id: { $in: convIds } });
  
  for (let conv of conversations) {
    if (!conv.members.some(m => m.toString() === userId.toString())) {
      throw new api_error('Not authorized', 403);
    }
  }

  await Message.updateMany(
    { 
      _id: { $in: messageIds },
      readBy: { $ne: userId }
    },
    { 
      $addToSet: { readBy: userId } 
    }
  );

  res.status(200).json({ status: 'success' });
});

// get unread message count for conversation
exports.get_unread_count = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversationId = req.params.conversationId;

  // Check authorization
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new api_error('Conversation not found', 404);
  
  if (!conv.members.some(m => m.toString() === userId.toString())) {
    throw new api_error('Not authorized', 403);
  }

  const count = await Message.countDocuments({
    conversationId,
    sender: { $ne: userId },
    'readBy.userId': { $ne: userId }
  });

  res.status(200).json({ count });
});

exports.delete_message = asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) throw new api_error('Message not found', 404);
  if (message.sender.toString() !== userId.toString()) {
    throw new api_error('Not authorized to delete this message', 403);
  }

  await message.deleteOne();
  
  res.status(200).json({ status: 'success', message: 'Message deleted' });
});
