const express = require("express");
const middlewares = require("./middlewares");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar middlewares
app.use(middlewares);

// Configurar rutas
app.get("/", (req, res) => {
  res.send("OK");
});
app.use("/api", routes);

// Sincronizar la base de datos y levantar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
