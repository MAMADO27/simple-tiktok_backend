const Conversation = require('../modules/conversation_module');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');

// create conversation between members (if exists return existing)
exports.create_conversation = asyncHandler(async (req, res) => {
  // expect members: [userId1, userId2, ...] in body
  const members = req.body.members;
  if (!members || !Array.isArray(members) || members.length < 2) {
    throw new api_error('members array with at least 2 users is required', 400);
  }

  // Try find existing conversation with exact same members (unordered)
  // Simple approach: find conversations that contain all members and count length equals
  const existing = await Conversation.findOne({
    members: { $all: members, $size: members.length }
  });

  if (existing) {
    return res.status(200).json({ data: existing });
  }

  const conv = await Conversation.create({ members, title: req.body.title });
  res.status(201).json({ data: conv });
});

// get conversations for current user (paginated)
exports.get_user_conversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({ members: userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: 'members', select: 'name email profileImg' });

  res.status(200).json({ results: conversations.length, data: conversations });
});

// get single conversation
exports.get_conversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id)
    .populate({ path: 'members', select: 'name email profileImg' });

  if (!conv) throw new api_error('Conversation not found', 404);
  res.status(200).json({ data: conv });
});
