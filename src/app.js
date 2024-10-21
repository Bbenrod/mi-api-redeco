const express = require("express");
const middlewares = require("./middlewares");
const routes = require("./routes");
const logger = require("./utils/logger");
const { sequelize } = require("./models");

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

sequelize
  .sync({ alter: true }) // Sincronización de Sequelize con alteración si es necesario
  .then(() => {
    logger.info("Base de datos sincronizada correctamente.");
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Error al sincronizar la base de datos: ${err.message}`);
  });

module.exports = app;
