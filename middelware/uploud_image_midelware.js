const multer = require('multer');
const api_error = require('../utils/api_error');

// إعدادات Multer خاصة بالصور فقط
const multer_options = () => {
  const multer_storage = multer.memoryStorage();

  const multer_filter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new api_error('Not an image! Please upload an image.', 400), false);
    }
  };

  return multer({ storage: multer_storage, fileFilter: multer_filter });
};

// رفع صورة واحدة
exports.upload_single_image = (fieldName) =>
  multer_options().single(fieldName);

// رفع عدة صور  
exports.upload_multiple_images = (array_of_fields) =>
  multer_options().fields(array_of_fields);
