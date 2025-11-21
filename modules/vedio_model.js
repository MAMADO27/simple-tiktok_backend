const mongoose = require('mongoose');

const vedio_schema=new mongoose.Schema({
    video_id: {
        type: String,
       //required: true,
        unique: true,
        minlength: 3,
        maxlength: 50,
    },
    title: {
        type: String,
        //required: true,
        minlength: 3,
        maxlength: 100,
    },
    description: {
        type: String,
      // required: true,
        minlength: 10,

    },

    hashtags: {
        type: [String],},
    thumbnail_url: {
        type: String,
        required: false 
        
    },
 
    duration: {
        type: Number,
    
    },
    video_url: {
  type: String,
  required: [true, 'Video URL is required']
    },
   public_id: {
  type: String,
  required: [true, 'Public ID is required']
    },
    slug: {
        type: String,
        unique: true
    },
    upload_date: {
        type: Date,
        default: Date.now
    }
},

{ timestamps: true });




module.exports = mongoose.model('Vedio', vedio_schema);