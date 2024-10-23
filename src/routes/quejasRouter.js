const express = require("express");
const { authMiddleware } = require("../middlewares/authHandler");
const {
  createQueja,
  deleteQueja,
  getQueja,
} = require("../controllers/quejasController");
const router = express.Router();

router.post("/", authMiddleware, createQueja);

router.delete("/", authMiddleware, deleteQueja);

router.get("/", authMiddleware, getQueja);

module.exports = router;
