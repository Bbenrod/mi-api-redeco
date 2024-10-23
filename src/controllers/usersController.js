const jwt = require("../utils/jwtUtils");

const createSuperUser = (req, res) => {
  res.send(`Ruta ${req.originalUrl} funcionando.`);
};
const createUser = (req, res) => {
  res.send(`Ruta ${req.originalUrl} funcionando.`);
};
const getToken = (req, res) => {
  res.send(`Ruta ${req.originalUrl} funcionando.`);
};
const createToken = (req, res) => {
  const token = jwt.createToken({ example: "" });
  res.json({ message: `Ruta ${req.originalUrl} funcionando.`, token });
};

module.exports = {
  createSuperUser,
  createUser,
  getToken,
  createToken,
};
