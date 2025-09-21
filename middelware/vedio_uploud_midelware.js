const multer = require('multer');
const api_error = require('../utils/api_error');
const multer_options = () => {
  const multer_storage = multer.memoryStorage();

  const multer_filter = (req, file, cb) => {
    if (file.mimetype.startsWith('video')) {
      cb(null, true);
    } else {
      cb(new api_error('Not a video! Please upload a video.', 400), false);
    }
  };

  return multer({ storage: multer_storage, fileFilter: multer_filter });
};

// Middleware لرفع فيديو واحد
exports.upload_single_video = (fieldName) => {
  const upload = multer_options();

  return [
    upload.single(fieldName),
    (req, res, next) => {
      if (!req.file) {
        return next(new api_error('Video file is required', 400));
      }
      next();
    },
  ];
};





