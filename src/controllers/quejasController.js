const createQueja = (req, res) => {
  res.send("Ruta /quejas funcionando correctamente.");
};

const deleteQueja = (req, res) => {
  res.send("Ruta DELETE /quejas funcionando correctamente.");
};

const getQueja = (req, res) => {
  res.send("Ruta GET /quejas funcionando correctamente.");
};

module.exports = {
  createQueja,
  deleteQueja,
  getQueja,
};
