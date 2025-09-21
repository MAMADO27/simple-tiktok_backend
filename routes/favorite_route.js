const express = require('express');
const router = express.Router();

const {
  add_favorite,
  get_user_favorites,
  get_favoriteBySlug,
  remove_favorite
} = require('../services/favorite_services');

const auth_services = require('../services/auth_services');
const allow_to = require('../middelware/allow_to');

//  Get all favorites for authenticated user
router.get('/', auth_services.protect, allow_to('user', 'admin'), get_user_favorites);
//  Get favorite by slug
router.get('/slug/:slug', auth_services.protect, allow_to('user', 'admin'), get_favoriteBySlug);

//  Add favorite by target_id
router.post('/:target_id', auth_services.protect, allow_to('user', 'admin'), add_favorite);

// Remove favorite by ID
router.delete('/:id', auth_services.protect, allow_to('user', 'admin'), remove_favorite);

module.exports = router;
