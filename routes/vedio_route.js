const express = require('express');
const router = express.Router();
const allow_to =require('../middelware/allow_to');
const auth_services =require('../services/auth_services');

const {
  get_all_videos,
  get_videoById,
  create_video,
  update_video,
  delete_video,
  upload_video_file
} = require('../services/vedio_services');

const {
  get_vedio_validator,
  create_vedio_validator,
  update_vedio_validator,
  delete_vedio_validator
} = require('../validations/vedio_validator');

// Routes

router.route('/')
  .get(
    auth_services.protect,
    allow_to('admin','manager','user'),
    get_all_videos
  )
  .post(
    auth_services.protect,
    allow_to('admin','manager','user'),
    /*create_vedio_validator,*/
    upload_video_file,
    create_video
  );

router.route('/:id')
  .get(
    auth_services.protect,
    allow_to('admin','manager','user'),
    get_vedio_validator,
    get_videoById
  )
  .put(
    auth_services.protect,
    allow_to('admin','manager','user'),
    update_vedio_validator,
    upload_video_file,
    update_video
  )
  .delete(
    auth_services.protect,
    allow_to('admin','manager'),
    delete_vedio_validator,
    delete_video
  );
module.exports = router;

