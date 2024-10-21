const sequelize = require("../../config/db");
const SuperUsuario = require("./superUsuario");
const Usuario = require("./usuario");
const Queja = require("./queja");
const logger = require("../utils/logger");

// Inicializar las asociaciones
const initializeAssociations = () => {
  try {
    SuperUsuario.hasMany(Usuario, {
      foreignKey: "superuser_id",
      sourceKey: "userid",
    });
    Usuario.belongsTo(SuperUsuario, {
      foreignKey: "superuser_id",
      targetKey: "userid",
    });

    SuperUsuario.hasMany(Queja, {
      foreignKey: "superuser_id",
      sourceKey: "userid",
    });
    Queja.belongsTo(SuperUsuario, {
      foreignKey: "superuser_id",
      targetKey: "userid",
    });

    logger.info("Asociaciones inicializadas correctamente.");
  } catch (error) {
    logger.error("Error al inicializar asociaciones:", error);
  }
};

// Llamar a la función de inicialización
initializeAssociations();

// Exportar Sequelize y los modelos
module.exports = { sequelize, SuperUsuario, Usuario, Queja };
