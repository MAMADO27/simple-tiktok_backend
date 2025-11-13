const asyncHandler = require('express-async-handler');
const Comment = require('../modules/comment_module');
const slugify = require('slugify');
const api_fetchers = require('../utils/api_fetchers');

exports.create_comment = asyncHandler(async (req, res, next) => {
    const { user_id, target_id, target_type, text } = req.body;
    const comment = await Comment.create({
         user: req.user._id,
        target_id:req.params.target_id,
        target_type,
        text,
        slug: slugify(text, { lower: true })
    });
    res.status(201).json({ data: comment });
});

// Get Comments by Target ID
exports.get_comments_by_target = asyncHandler(async (req, res) => {
    const target_id = req.params.target_id;
    
    const count_docs = await Comment.countDocuments({ target_id });
    
    const features = new api_fetchers(
        Comment.find({ target_id }).populate('user', 'username email'),
        req.query
    )
    .filter()
    .limitFields()
    .paginate(count_docs);
    
    const comments = await features.mongooseQuery;
    
    res.status(200).json({ 
        results: comments.length,
        pagination: features.pagination_result,
        data: comments 
    });
});

//GET user comments
exports.get_user_comments= asyncHandler(async (req, res, next) => {
    const user_id = req.user._id;
    
    const count_docs = await Comment.countDocuments({ user: user_id });
    
    const features = new api_fetchers(
        Comment.find({ user: user_id }).populate('user', 'username email'),
        req.query
    )
    .filter()
    .sort()
    .limitFields()
    .paginate(count_docs);
    
    const comments = await features.mongooseQuery;
    
    res.status(200).json({ 
        results: comments.length,
        pagination: features.pagination_result,
        data: comments 
    });
});

// Delete Comment
exports.delete_comment = asyncHandler(async (req, res) => {
    const comment_id = req.params.comment_id;
    const comment = await Comment.findByIdAndDelete(comment_id);
    if (!comment) { 
        return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(204).json({ message: 'Comment deleted successfully' });
});