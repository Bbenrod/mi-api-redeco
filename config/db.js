const { Sequelize } = require("sequelize");
const logger = require("../src/utils/logger");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    logger.info("Conexión a la base de datos establecida correctamente.");
  })
  .catch((err) => {
    logger.error("No se pudo conectar a la base de datos:", err);
  });

module.exports = sequelize;
