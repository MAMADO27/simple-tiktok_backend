const express = require('express');
const passport = require('passport');
const router = express.Router();
const create_token = require('../utils/create_token');

// start login with google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
  const token = create_token({
  id: req.user._id,
  email: req.user.email
});
    res.json({
      message: "Login successful ",
      token,
      user: req.user
    });
  }
);
router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: "Login failed " });
});
 
/////////////////////////////////////////////////////////////////////////////////////////
// Normal auth routes (signup, login, forget password, reset password)
////////////////////////////////////////////////////////////////////////////////
const {
  sign_up_Validator,
  login_Validator,
} = require('../validations/auth_validator');
const auth_services = require('../services/auth_services');
const {
  signup,
  login,
  forget_password,
  verify_reset_code,
  reset_password,
} = require('../services/auth_services');




router.route('/signup').post(sign_up_Validator, signup);
router.route('/login').post(login_Validator, login);
router.route('/forgote_password').post(auth_services.forget_password);
router.route('/verify_reset_code').post(auth_services.verify_reset_code);
router.route('/reset_password').put(auth_services.reset_password);

module.exports = router;
