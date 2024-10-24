const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const crypto = require("crypto");

const SuperUsuario = sequelize.define(
  "SuperUsuario",
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
    institucionid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => crypto.randomUUID(),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    profileid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => crypto.randomUUID(),
    },
    token_access: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = SuperUsuario;
