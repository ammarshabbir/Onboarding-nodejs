const express = require('express');

const {  signup,
  verifyOtp,
  resendSignupOtp,
  signin,
  forgotEmail,
  verifyForgotOtp,
  changePassword} = require('../controllers/userAuthController');

const router = express.Router();

router.post('/signup',signup);
router.post('/verifyOtp',verifyOtp);
router.post('/resendSignupOtp',resendSignupOtp);
router.post('/signin',signin);
router.post('/forgotEmail',forgotEmail);
router.post('/verifyForgotOtp',verifyForgotOtp);
router.post('/changePassword',changePassword);

module.exports = router;