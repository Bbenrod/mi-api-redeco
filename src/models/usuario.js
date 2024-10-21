const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const bcrypt = require("bcrypt");

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
        model: "SuperUsuarios", // Asegúrate de que esto coincida con el nombre de la tabla
        key: "userid",
      },
    },
  },
  {
    timestamps: false,
  }
);

// Hashear la contraseña antes de crear un usuario
Usuario.beforeCreate(async (user) => {
  const saltRounds = 10;
  user.password = await bcrypt.hash(user.password, saltRounds);
});

module.exports = Usuario;
