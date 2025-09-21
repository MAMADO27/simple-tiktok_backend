const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Favorite = require('../modules/favorite_module');
const Video = require('../modules/vedio_model'); // تأكد إن المسار صحيح
const api_error = require('../utils/api_error');

// Create Favorite
exports.add_favorite = asyncHandler(async (req, res) => {
  const target_id = req.params.target_id;
  const target_type = "Video"; 

  // Validation
  if (!target_id) {
    throw new api_error('Target ID is required', 400);
  }

 
  const videoExists = await Video.findById(target_id);
  if (!videoExists) {
    throw new api_error('Video not found', 404);
  }

 
  const exists = await Favorite.findOne({ user: req.user._id, target_id, target_type });
  if (exists) {
    throw new api_error('Already added to favorites', 400);
  }

 
  const slug = slugify(`${req.user._id}-${target_id}-${target_type}`, { lower: true });

  
  const favorite = await Favorite.create({
    user: req.user._id,
    target_id,
    target_type,
    slug
  });

  res.status(201).json({ data: favorite });
});

// Get all favorites for the logged-in user
exports.get_user_favorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id });

  res.status(200).json({
    results: favorites.length,
    data: favorites
  });
});

// Get single favorite by slug
exports.get_favoriteBySlug = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({ slug: req.params.slug });
  if (!favorite) {
    throw new api_error('Favorite not found', 404);
  }

  res.status(200).json({ data: favorite });
});

// Remove favorite
exports.remove_favorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({
    _id: req.params.id
  });

  if (!favorite) {
    throw new api_error('Favorite not found', 404);
  }

  res.status(204).send();
});
