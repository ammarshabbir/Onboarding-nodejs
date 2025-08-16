const express = require('express');
const {
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword

} = require('../controllers/userController');

const router = express.Router();

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/change-pwd/:id', changeUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;