const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const SuperUsuario = require("./superUsuario"); // Asegúrate de importar el modelo

const Queja = sequelize.define(
  "Queja",
  {
    QuejasDenominacion: {
      type: DataTypes.STRING(400),
      allowNull: false,
    },
    QuejasSector: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    QuejasNoMes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    QuejasFolio: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    QuejasFecRecepcion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    QuejasMedio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasNivelAT: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasProducto: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    QuejasCausa: {
      type: DataTypes.STRING(4),
      allowNull: false,
    },
    QuejasPORI: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    QuejasEstatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasEstados: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasMunId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasLocId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasColId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasCP: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasTipoPersona: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QuejasSexo: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    QuejasEdad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    QuejasFecResolucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    QuejasFecNotificacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    QuejasRespuesta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    QuejasNumPenal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    QuejasPenalizacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    superuser_id: {
      type: DataTypes.UUID, // Tipo UUID para la relación
      allowNull: false, // No puede ser nulo
      references: {
        model: SuperUsuario, // Referencia al modelo SuperUsuario
        key: "userid", // Clave primaria en SuperUsuario
      },
    },
  },
  {
    timestamps: false,
  }
);

// Definición de la relación con SuperUsuario
Queja.belongsTo(SuperUsuario, {
  foreignKey: "superuser_id", // Clave foránea en Queja
  targetKey: "userid", // Clave primaria en SuperUsuario
});

module.exports = Queja;
