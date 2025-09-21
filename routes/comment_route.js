const express = require('express');
const router = express.Router();

const {
  create_comment,
  get_comments_by_target,
  get_user_comments,
  delete_comment
} = require('../services/comment_services');

const auth_services = require('../services/auth_services');
const allow_to = require('../middelware/allow_to');

//  Get user comments
router.route('/my_comments')
  .get(
    auth_services.protect,
    allow_to('user', 'admin'),
    get_user_comments
  );


router.route('/:target_id')
  .post(
    auth_services.protect,
    allow_to('user', 'admin'),
    create_comment
  )
  .get(
    auth_services.protect,
    allow_to('user', 'admin'),
    get_comments_by_target
  );

router.route('/:target_id/:comment_id')
  .delete(
    auth_services.protect,
    allow_to('user', 'admin'),
    delete_comment
  );



module.exports = router;