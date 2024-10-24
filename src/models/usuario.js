const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    userid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    superuser_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "SuperUsuarios",
        key: "userid",
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Usuario;
