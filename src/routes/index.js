const express = require("express");

const router = express.Router();

// Configuración de las rutas
router.get("/", (req, res) => {
  res.send("Hello project");
});

module.exports = router;
