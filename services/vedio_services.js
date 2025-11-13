const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const vedio_schema = require('../modules/vedio_model');
const slugify = require('slugify');
const api_error = require('../utils/api_error');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const streamifier = require('streamifier');
const api_fetchers = require('../utils/api_fetchers');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage (في الذاكرة)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware لرفع الفيديو
exports.upload_video_file = [
  upload.single('file'),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      throw new api_error('Video file is required', 400);
    }

    // Cloudinary Upload باستخدام streamifier
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'videos',
          resource_type: 'video',
          public_id: `video-${uuidv4()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    req.body.video_url = result.secure_url;
    req.body.public_id = result.public_id;
    req.body.duration = result.duration;

      req.body.thumbnail_url = cloudinary.url(result.public_id + '.jpg', {
      resource_type: 'video',
       format: 'jpg',
       transformation: [
        { width: 320, height: 240, crop: 'thumb', gravity: 'auto' },
     ],
});

    next();
  }),
 

];

// Create Video
exports.create_video = asyncHandler(async (req, res) => {
  const { video_id, title, description } = req.body;

  if (!video_id || video_id.length < 3) {
    throw new api_error('Video ID must be at least 3 characters long', 400);
  }
  if (!title || title.length < 3) {
    throw new api_error('Title must be at least 3 characters long', 400);
  }
  if (!description || description.length < 10) {
    throw new api_error('Description must be at least 10 characters long', 400);
  }

  const exists = await vedio_schema.findOne({ video_id });
  if (exists) {
    throw new api_error('video_id already exists', 400);
  }

  req.body.slug = slugify(title);
  const video = await vedio_schema.create(req.body);

  res.status(201).json({ data: video });
});

// Get All Videos
exports.get_all_videos = asyncHandler(async (req, res) => {
  const count_docs = await vedio_schema.countDocuments();
  
  const features = new api_fetchers(vedio_schema.find(), req.query)
    .filter()
    .search('videos')
    .sort()
    .limitFields()
    .paginate(count_docs);
  
  const videos = await features.mongooseQuery;
  
  res.status(200).json({ 
    results: videos.length, 
    pagination: features.pagination_result,
    data: videos 
  });
});

// Get Video By ID
exports.get_videoById = asyncHandler(async (req, res) => {
  const video = await vedio_schema.findById(req.params.id);
  if (!video) throw new api_error('Video not found', 404);
  res.status(200).json({ data: video });
});

// Update Video
exports.update_video = asyncHandler(async (req, res) => {
  const old_video = await vedio_schema.findById(req.params.id);
  if (!old_video) throw new api_error('Video not found', 404);

  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  if (req.body.public_id && old_video.public_id) {
    await cloudinary.uploader.destroy(old_video.public_id, {
      resource_type: 'video',
    });
  }

  const updated_video = await vedio_schema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json({ data: updated_video });
});

// Delete Video
exports.delete_video = asyncHandler(async (req, res) => {
  const video = await vedio_schema.findByIdAndDelete(req.params.id);
  if (!video) throw new api_error('Video not found', 404);

  await cloudinary.uploader.destroy(video.public_id, {
    resource_type: 'video',
  });

 res.status(200).json({ message: 'Video deleted', data: video });
});