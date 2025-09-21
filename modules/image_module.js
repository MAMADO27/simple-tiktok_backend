const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const image_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upload_date: {
        type: Date,
        default: Date.now
    },
    image_url: {   
        type: String,
        required: true
    },
    public_id: {   
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Image', image_schema);