const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const favorite_schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    target_id: { type: mongoose.Schema.Types.ObjectId,
         required: true
         },
    target_type: { type: String, 
        enum: ['Video', 'Image'] 
    },
     
    slug: {
        type: String,
        unique: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favorite_schema);