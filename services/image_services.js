const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const Image = require('../modules/image_module'); 
const asyncHandler = require('express-async-handler');
const factory = require('../services/handler_factory');
const api_error = require('../utils/api_error');
const streamifier = require('streamifier');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.upload_user_image = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new api_error('Image file is required', 400);
  }

 
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'images',
        public_id: `image-${uuidv4()}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  req.body.image_url = result.secure_url;
  req.body.public_id = result.public_id;

  next();
});

// Get all images
exports.get_all_images = factory.get_all(Image, 'image');

//  Get single image
exports.get_image = factory.get_one(Image);

//  Create image
exports.create_image = asyncHandler(async (req, res) => {
  if (req.user && req.user._id) {
    req.body.uploader = req.user._id;
  }

 
  if (!req.body.slug) {
    req.body.slug = uuidv4(); 
  }

  console.log("req.body:", req.body);

  const document = await Image.create({ ...req.body });
  res.status(201).json({ data: document });
});


// Update image
exports.update_image = asyncHandler(async (req, res) => {
  const old_image = await Image.findById(req.params.id);
  if (!old_image) throw new api_error('Image not found', 404);

 
  if (req.body.public_id && old_image.public_id) {
    await cloudinary.uploader.destroy(old_image.public_id, { resource_type: 'image' });
  }

  const updated_image = await Image.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ data: updated_image });
});

// Delete image
exports.delete_image = asyncHandler(async (req, res) => {
  const image = await Image.findByIdAndDelete(req.params.id);
  if (!image) throw new api_error('Image not found', 404);

  await cloudinary.uploader.destroy(image.public_id, { resource_type: 'image' });

  res.status(204).json({message: 'Image deleted successfully'});
});
