const { check, body } = require('express-validator');
const validator_middelware = require('../middelware/validator_middelware');

exports.get_vedio_validator = [
    check('id').isMongoId().withMessage("Invalid Video ID Format"),
    validator_middelware
];

exports.create_vedio_validator = [
    check('video_id')
        .notEmpty().withMessage('Video ID is required')
        .isLength({ min: 3 }).withMessage('Video ID must be at least 3 characters long')
        .isLength({ max: 50 }).withMessage('Video ID must be at most 50 characters long'),
    check('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long')
        .isLength({ max: 100 }).withMessage('Title must be at most 100 characters long'),
    check('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
    validator_middelware
];

exports.update_vedio_validator = [
    check('id').isMongoId().withMessage("Invalid Video ID Format"),
    body('video_id').optional()
        .isLength({ min: 3 }).withMessage('Video ID must be at least 3 characters long')
        .isLength({ max: 50 }).withMessage('Video ID must be at most 50 characters long'),
    validator_middelware
];

exports.delete_vedio_validator = [
    check('id').isMongoId().withMessage("Invalid Video ID Format"),
    validator_middelware
];
