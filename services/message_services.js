const Message = require('../modules/message_module');
const Conversation = require('../modules/conversation_module');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');

// create message (POST /messages)
exports.create_message = asyncHandler(async (req, res) => {
 
  const { conversationId, text, attachments } = req.body;
  const sender = req.user._id;

  if (!conversationId) throw new api_error('conversationId is required', 400);
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new api_error('Conversation not found', 404);

  //  check sender is member
  if (!conv.members.find(m => m.toString() === sender.toString())) {
    throw new api_error('You are not a member of this conversation', 403);
  }

  const msg = await Message.create({ conversationId, sender, text, attachments });
  // update conversation updatedAt
  await Conversation.findByIdAndUpdate(conversationId, { $set: { updatedAt: Date.now() } });

  // populate sender for response
  await msg.populate({ path: 'sender', select: 'name profileImg email' }).execPopulate?.() || await msg.populate('sender', 'name profileImg email');

  // Return created message (server will also emit via socket)
  res.status(201).json({ data: msg });
});

// get messages for conversation (paginated, newest last)
exports.get_messages = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  if (!conversationId) throw new api_error('conversationId is required', 400);

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 }) 
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profileImg');

  res.status(200).json({ results: messages.length, data: messages });
});

// mark message(s) as read (optional)
exports.mark_read = asyncHandler(async (req, res) => {
  const { messageIds } = req.body; // array
  const userId = req.user._id;
  if (!Array.isArray(messageIds) || messageIds.length === 0) throw new api_error('messageIds array required', 400);

  await Message.updateMany(
    { _id: { $in: messageIds } },
    { $addToSet: { readBy: userId } }
  );

  res.status(200).json({ status: 'success' });
});
