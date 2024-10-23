const express = require("express");
const usersRouter = require("./usersRouter");
const quejasRouter = require("./quejasRouter");
const router = express.Router();

// Configuración de las rutas
router.get("/", (req, res) => {
  res.send("Hello project");
});

router.use("/auth/users", usersRouter);
router.use("/quejas", quejasRouter);

module.exports = router;
