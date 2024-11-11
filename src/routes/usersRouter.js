const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/authHandler');
const {
  getToken,
  createUser,
  createSuperUser,
} = require('../controllers/usersController');

router.post('/create-super-user', createSuperUser);
router.post('/create-user', authMiddleware, createUser);
router.get('/token', getToken);

module.exports = router;
