const express = require('express');
const { upload_single_image, upload_multiple_images } = require('../middelware/uploud_image_midelware');
const imageService = require('../services/image_services');

const router = express.Router();

router.route('/')
  .get(imageService.get_all_images)
  .post(
    upload_single_image('file'),   
    imageService.upload_user_image, 
    imageService.create_image
  );

router.route('/:id')
  .get(imageService.get_image)
  .put(
    upload_single_image('file'),    
    imageService.upload_user_image,
    imageService.update_image
  )
  .delete(imageService.delete_image);

module.exports = router;
