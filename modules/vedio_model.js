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

const set_thumbnail_url = (doc) => {
    if (doc.thumbnail_url && !doc.thumbnail_url.startsWith('http')) {
        doc.thumbnail_url = `${process.env.BASE_URL}/videos/${doc.thumbnail_url}`;
    }
};

const set_video_url = (doc) => {
    if (doc.video_url && !doc.video_url.startsWith('http')) {
        doc.video_url = `${process.env.BASE_URL}/videos/${doc.video_url}`;
    }
};

vedio_schema.post('init', function(doc) {
    set_thumbnail_url(doc);
});
vedio_schema.post('save', function(doc) {
    set_thumbnail_url(doc);
});

vedio_schema.post('init', function(doc) {
    set_video_url(doc);
});
vedio_schema.post('save', function(doc) {
    set_video_url(doc);
});

module.exports = mongoose.model('Vedio', vedio_schema);