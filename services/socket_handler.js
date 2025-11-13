const Message = require('../modules/message_module');
const Conversation = require('../modules/conversation_module');

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("authenticate", async ({ userId }) => {
      try {
        socket.user = userId;
        console.log(`Socket ${socket.id} authenticated as ${userId}`);
      } catch (error) {
        console.error('Authenticate error:', error);
        socket.emit("errorMessage", { msg: error.message });
      }
    });

    socket.on("joinConversation", async (conversationId) => {
      try {
        socket.join(conversationId);
        console.log(`User ${socket.user} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit("errorMessage", { msg: error.message });
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text } = data;
        const senderId = socket.user;

        const conv = await Conversation.findById(conversationId);
        if (!conv || !conv.members.includes(senderId)) {
          return socket.emit("errorMessage", { msg: "You are not in this conversation" });
        }

        const newMessage = await Message.create({ 
          conversationId, 
          sender: senderId, 
          text 
        });
        
        io.to(conversationId).emit("receiveMessage", newMessage);
        console.log("Message saved & sent:", newMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit("errorMessage", { msg: error.message });
      }
    });

    socket.on("messageRead", async ({ messageId }) => {
      try {
        const userId = socket.user;
        const message = await Message.findById(messageId);
        
        if (!message) {
          return socket.emit("errorMessage", { msg: "Message not found" });
        }

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
      } catch (error) {
        console.error('Message read error:', error);
        socket.emit("errorMessage", { msg: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};