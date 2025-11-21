const jwt = require('jsonwebtoken');
const Message = require('../modules/message_module');
const Conversation = require('../modules/conversation_module');

// Socket Authentication Middleware
const socketAuth = (socket, next) => {
  
  const token =
   socket.handshake.auth?.token ||
    socket.handshake.headers?.token ||  
    socket.handshake.query?.token ||
    (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // support several common payload key names
    socket.userId = decoded.userId || decoded.id || decoded.user || decoded._id;
    if (!socket.userId) {
      console.warn('socketAuth: token decoded but no user id in payload', decoded);
      return next(new Error('Invalid token payload'));
    }
    return next();
  } catch (err) {
    console.error('socketAuth verify error:', err.message);
    return next(new Error('Invalid token'));
  }};

module.exports = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (socket: ${socket.id})`);

    // Join conversation room
    socket.on("joinConversation", async (conversationId) => {
      try {
        if (!conversationId) {
          return socket.emit("errorMessage", { msg: "conversationId required" });
        }

        const conv = await Conversation.findById(conversationId);
        
        if (!conv) {
          return socket.emit("errorMessage", { msg: "Conversation not found" });
        }

        // Authorization check
        if (!conv.members.some(m => m.toString() === socket.userId.toString())) {
          return socket.emit("errorMessage", { msg: "Not authorized" });
        }

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        socket.emit("joinedConversation", { conversationId });
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit("errorMessage", { msg: "Failed to join conversation" });
      }
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text, attachments } = data;
        const senderId = socket.userId;

        // Validation
        if (!conversationId) {
          return socket.emit("errorMessage", { msg: "conversationId required" });
        }

        if (!text && (!attachments || attachments.length === 0)) {
          return socket.emit("errorMessage", { msg: "Message must have text or attachments" });
        }

        // Check conversation exists and user is member
        const conv = await Conversation.findById(conversationId);
        
        if (!conv) {
          return socket.emit("errorMessage", { msg: "Conversation not found" });
        }

        if (!conv.members.some(m => m.toString() === senderId.toString())) {
          return socket.emit("errorMessage", { msg: "You are not in this conversation" });
        }

        // Create message
        const newMessage = await Message.create({ 
          conversationId, 
          sender: senderId, 
          text,
          attachments: attachments || []
        });

        // Populate sender info
        await newMessage.populate('sender', 'name profileImg email');

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversationId, { 
          updatedAt: Date.now() 
        });

        // Emit to all users in conversation
        io.to(conversationId).emit("receiveMessage", newMessage);
        
        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit("errorMessage", { msg: "Failed to send message" });
      }
    });

    // Mark message as read
socket.on("messageRead", async ({ messageId }) => {
  try {
    const userId = socket.userId;

    if (!messageId) {
      return socket.emit("errorMessage", { msg: "messageId required" });
    }

    const message = await Message.findById(messageId);
    
    if (!message) {
      return socket.emit("errorMessage", { msg: "Message not found" });
    }

    // Check if user is member of conversation
    const conv = await Conversation.findById(message.conversationId);
    
    if (!conv) {
      return socket.emit("errorMessage", { msg: "Conversation not found" });
    }

    if (!conv.members.some(m => m.toString() === userId.toString())) {
      return socket.emit("errorMessage", { msg: "Not authorized" });
    }

    // UPDATED: Simple check for ObjectId
    const alreadyRead = message.readBy.some(r => r.toString() === userId.toString());

    if (!alreadyRead) {
      message.readBy.push(userId);
      await message.save();

      // Notify all users in conversation
      io.to(message.conversationId.toString()).emit("messageReadUpdate", {
        messageId,
        userId,
        readAt: new Date() // Send to client but don't store in DB
      });
    }
  } catch (error) {
    console.error('Message read error:', error);
    socket.emit("errorMessage", { msg: "Failed to mark message as read" });
  }
});

    // Typing indicator (optional feature)
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("userTyping", { 
        userId: socket.userId,
        conversationId 
      });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("userStoppedTyping", { 
        userId: socket.userId,
        conversationId 
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId} (socket: ${socket.id})`);
    });
  });
};