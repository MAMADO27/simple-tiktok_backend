const express = require('express');
const router = express.Router();
const {
  create_like,
  get_likes_by_video,
  delete_like,
  get_user_likes
} = require('../services/like_services');
const auth_services = require('../services/auth_services');
const allow_to = require('../middelware/allow_to');

router.route('/my_likes').get(auth_services.protect,
      allow_to('user'),get_user_likes);


router.route('/:target_id')
  .post(auth_services.protect,
    allow_to('user'), create_like)
  .get(auth_services.protect,
    allow_to('user'),get_likes_by_video)
  .delete( auth_services.protect,
    allow_to('user'),delete_like);



module.exports = router;
