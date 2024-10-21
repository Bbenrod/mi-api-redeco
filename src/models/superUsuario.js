const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    profileid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_access: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Generar ids y hashear la contraseña antes de crear un super usuario
SuperUsuario.beforeCreate(async (user) => {
  user.institucionid = crypto.randomUUID();
  user.profileid = crypto.randomUUID();

  const saltRounds = 10;
  user.password = await bcrypt.hash(user.password, saltRounds);
});

module.exports = SuperUsuario;
