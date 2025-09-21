const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const comment_schema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
},
    target_id: { type: mongoose.Schema.Types.ObjectId,
         required: true
         },
    target_type: { type: String, 
        enum: ['Video', 'Image'],
         /*required: true*/
        },
    text: { type: String, required: true },
    slug: {
        type: String,

    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', comment_schema);