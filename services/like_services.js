const asyncHandler = require('express-async-handler');
const Like = require('../modules/like_module');
const slugify = require('slugify');

exports.create_like = asyncHandler(async (req, res, next) => {
    const user_id = req.user._id;
    const target_id = req.params.target_id;

    const existingLike = await Like.findOne({
        user: user_id,
        target_id: target_id,
       // target_type: 'Video'
    });

    if (existingLike) {
        return res.status(400).json({ message: 'You already liked this video' });
    }

    const slug = slugify(`${user_id}-${target_id}`, { lower: true });

    const like = await Like.create({
        user: user_id,
        target_id: target_id,
        target_type: 'Video',
        slug 
    });

    res.status(201).json({ data: like });
});

exports.get_likes_by_video = asyncHandler(async (req, res) => {
    const target_id = req.params.target_id;
    const likes = await Like.find({ target_id: target_id, target_type: 'Video' })
        .populate( 'user','name');
    res.status(200).json({ results: likes.length, data: likes });
});

exports.get_user_likes = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const likes = await Like.find({ user: user_id })
        .populate('target_id', 'title');
    res.status(200).json({ results: likes.length, data: likes });
});

exports.delete_like = asyncHandler(async (req, res) => {
     const user_id = req.user._id;
   const target_id = req.params.target_id;
    const like = await Like.findOneAndDelete({
        user: user_id,
        target_id: target_id,
        
    });

    if (!like) {
        return res.status(404).json({ message: 'Like not found' });
    }
    res.status(204).json({ message: 'Like deleted successfully' });
});