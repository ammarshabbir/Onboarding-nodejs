const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  signup,
  verifyOtp,
  resendSignupOtp,
  signin,
  forgotEmail,
  verifyForgotOtp,
  changePassword
} = require('../controllers/userController');

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/signup',signup);
router.post('/verifyOtp',verifyOtp);
router.post('/resendSignupOtp',resendSignupOtp);
router.post('/signin',signin);
router.post('/forgotEmail',forgotEmail);
router.post('/verifyForgotOtp',verifyForgotOtp);
router.post('/changePassword',changePassword);









module.exports = router;