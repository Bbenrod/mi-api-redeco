const express = require("express");
const { authMiddleware } = require("../middlewares/authHandler");
const {
  createQueja,
  deleteQueja,
  getQuejas,
} = require("../controllers/quejasController");
const router = express.Router();

router.post("/", authMiddleware, createQueja);

router.delete("/", authMiddleware, deleteQueja);

router.get("/", authMiddleware, getQuejas);

module.exports = router;
