const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authHandler");
const {
  createToken,
  getToken,
  createUser,
  createSuperUser,
} = require("../controllers/usersController");

router.post("/create-super-user", createSuperUser);
router.post("/create-user", createUser);
router.get("/token", authMiddleware, getToken);
router.post("/gtoken", createToken);

module.exports = router;
