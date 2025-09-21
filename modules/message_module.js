const mongoose = require('mongoose');
const message_schema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId,
     ref: 'Conversation', 
     required: true 
    },
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
      required: true 
    },
  text: { 
    type: String 
},
  attachments: [{
    url: String,
    type: String
  }],
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
     }], // users who read
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// index for fast retrieval by conversation + createdAt
message_schema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', message_schema);
