const mongoose = require('mongoose');

const conversation_schema = new mongoose.Schema({
  members: [
    {
         type: mongoose.Schema.Types.ObjectId,
          ref: 'User', 
          required: true 
        }
  ],
  title: { 
    type: String
 },
  createdAt: {
     type: Date, 
     default: Date.now 
    }
}, {
  timestamps: true
});

// index to quickly lookup conversations that contain a user
conversation_schema.index({ members: 1 });

module.exports = mongoose.model('Conversation', conversation_schema);
