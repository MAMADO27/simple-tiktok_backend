const asyncHandler = require('express-async-handler');
const Message = require('../modules/message_module');
const Conversation = require('../modules/conversation_module');
module.exports = (io) => {io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("authenticate", asyncHandler(async (socket, { userId }) => {
    socket.user = userId;
    console.log(`Socket ${socket.id} authenticated as ${userId}`);
  }));

  socket.on("joinConversation", asyncHandler(async (socket, conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.user} joined conversation ${conversationId}`);
  }));

  socket.on("sendMessage", asyncHandler(async (socket, data) => {
    const { conversationId, text } = data;
    const senderId = socket.user;

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.members.includes(senderId)) {
      return socket.emit("errorMessage", { msg: " You are not in this conversation" });
    }

    const newMessage = await Message.create({ conversationId, sender: senderId, text });
    io.to(conversationId).emit("receiveMessage", newMessage);
    console.log(" Message saved & sent:", newMessage);
  }));

  socket.on("messageRead", asyncHandler(async (socket, { messageId }) => {
    const userId = socket.user;
    const message = await Message.findById(messageId);
    const conv = await Conversation.findById(message.conversationId);

    if (!conv.members.includes(userId)) {
      return socket.emit("errorMessage", { msg: "You are not a member of this conversation" });
    }

    if (!message.readBy.some(r => r.userId.toString() === userId)) {
      message.readBy.push({ userId, readAt: new Date() });
      await message.save();

      io.to(message.conversationId.toString()).emit("messageReadUpdate", {
        messageId,
        userId,
        readAt: new Date()
      });
    }
  }));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
}