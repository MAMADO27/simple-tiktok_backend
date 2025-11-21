const Conversation = require('../modules/conversation_module');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');

// create conversation
exports.create_conversation = asyncHandler(async (req, res) => {
  let members = req.body.members;
  
  if (!members || !Array.isArray(members) || members.length < 1) {
    throw new api_error('members array is required', 400);
  }

  const currentUserId = req.user._id.toString();
  if (!members.some(m => m.toString() === currentUserId)) {
    members.push(currentUserId);
  }

  if (members.length < 2) {
    throw new api_error('Conversation needs at least 2 members', 400);
  }

  const existing = await Conversation.findOne({
    members: { $all: members },
    $expr: { $eq: [{ $size: "$members" }, members.length] }
  });

  if (existing) {
    // Return with populated members
    await existing.populate('members', 'name email profileImg');
    return res.status(200).json({ data: existing });
  }

  const conv = await Conversation.create({ members, title: req.body.title });
  await conv.populate('members', 'name email profileImg');
  
  res.status(201).json({ data: conv });
});

// get conversations for current user
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

  //Total count for pagination
  const total = await Conversation.countDocuments({ members: userId });

  res.status(200).json({ 
    results: conversations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: conversations 
  });
});

// get single conversation
exports.get_conversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id)
    .populate({ path: 'members', select: 'name email profileImg' });

  if (!conv) throw new api_error('Conversation not found', 404);
  
  //: Check authorization
  if (!conv.members.some(m => m._id.toString() === req.user._id.toString())) {
    throw new api_error('Not authorized to access this conversation', 403);
  }

  res.status(200).json({ data: conv });
});

exports.delete_conversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  
  if (!conv) throw new api_error('Conversation not found', 404);
  
  // Check authorization
  if (!conv.members.some(m => m.toString() === req.user._id.toString())) {
    throw new api_error('Not authorized', 403);
  }

  await conv.deleteOne();
  
  res.status(200).json({ status: 'success', message: 'Conversation deleted' });
});
exports.leave_conversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  
  if (!conv) throw new api_error('Conversation not found', 404);
  
  if (!conv.members.some(m => m.toString() === req.user._id.toString())) {
    throw new api_error('Not a member of this conversation', 403);
  }

  // Remove user from members
  conv.members = conv.members.filter(m => m.toString() !== req.user._id.toString());
  
  // If no members left, delete conversation
  if (conv.members.length === 0) {
    await conv.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Conversation deleted' });
  }
  
  await conv.save();
  res.status(200).json({ status: 'success', data: conv });
});