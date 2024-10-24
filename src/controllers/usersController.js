const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const jwt = require("../utils/jwtUtils");
const Usuario = require("../models/usuario");
const SuperUsuario = require("../models/superUsuario");
const logger = require("../utils/logger");

// Crear superusuario
const createSuperUser = async (req, res) => {
  const { key, username, password, confirm_password } = req.body;

  // Verificar que el `key` sea igual a "123"
  if (key !== "123") {
    return res.status(403).json({ message: "Llave de acceso incorrecta." });
  }

  // Verificar que las contraseñas coincidan
  if (password !== confirm_password) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }

  try {
    // Buscar si ya existe un superusuario con ese nombre de usuario
    const existingSuperUser = await SuperUsuario.findOne({
      where: { username },
    });

    if (existingSuperUser) {
      // Si ya existe, verificar si la contraseña proporcionada es correcta
      const isPasswordCorrect = await comparePassword(
        password,
        existingSuperUser.password
      );

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Contraseña incorrecta." });
      }

      // Verificar si ya tiene un token activo
      let token_access;
      try {
        jwt.verifyToken(existingSuperUser.token_access); // Verifica si el token es válido
        token_access = existingSuperUser.token_access; // Si es válido, usar el mismo token
      } catch (error) {
        // Si el token ha expirado o es inválido, generar uno nuevo
        token_access = jwt.createToken({ id: existingSuperUser.userid });
        existingSuperUser.token_access = token_access;
        await existingSuperUser.save();
      }

      return res.status(200).json({
        message: "El superusuario ya existe. Se ha validado la autenticación.",
        data: {
          userid: existingSuperUser.userid,
          username: existingSuperUser.username,
          token_access,
        },
      });
    }

    // Si no existe, crear un nuevo superusuario
    if (!username) return res.status(401).json({ message: "Usuario vacio." });

    const hashedPassword = await hashPassword(password);
    const newSuperUsuario = await SuperUsuario.create({
      key,
      username,
      password: hashedPassword,
    });

    // Crear el token de acceso
    const token_access = jwt.createToken({ id: newSuperUsuario.userid });

    // Guardar el token en el nuevo superusuario
    newSuperUsuario.token_access = token_access;
    await newSuperUsuario.save();

    return res.status(201).json({
      message: "El superusuario ha sido creado exitosamente!",
      data: {
        userid: newSuperUsuario.userid,
        username: newSuperUsuario.username,
        token_access: newSuperUsuario.token_access,
      },
    });
  } catch (error) {
    logger.error("Error al crear el superUsuario:", error);
    return res
      .status(500)
      .json({ message: "Error al procesar la solicitud.", error });
  }
};

// Crear usuario
const createUser = async (req, res) => {
  const { username, password, confirm_password } = req.body;

  // Obtenemos el superuser_id del token ya validado en el middleware
  const superuser_id = req.user.id;

  // Verificar si el username está vacío
  if (!username) {
    return res.status(401).json({ message: "Usuario vacío." });
  }

  // Verificar que las contraseñas coincidan
  if (password !== confirm_password) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }

  try {
    // Buscar si ya existe un usuario con ese nombre de usuario
    const existingUsuario = await Usuario.findOne({
      where: { username },
    });

    // Obtener el superusuario correspondiente
    const superUsuario = await SuperUsuario.findOne({
      where: { userid: superuser_id },
    });

    if (!superUsuario) {
      return res.status(404).json({ message: "Superusuario no encontrado." });
    }

    let token_access;

    // Verificar si el token del superusuario es válido o si ha expirado
    try {
      jwt.verifyToken(superUsuario.token_access); // Si es válido
      token_access = superUsuario.token_access;
    } catch (error) {
      // Si el token ha expirado o es inválido, devolver un error y no crear el usuario
      return res.status(401).json({
        message:
          "El token del superusuario ha caducado o es inválido. Por favor, actualízalo en /auth/users/token/.",
      });
    }

    if (existingUsuario) {
      // Si el usuario ya existe, devolver el token del superusuario
      return res.status(200).json({
        message: "El usuario ya existe, devolviendo token del superusuario.",
        data: {
          userid: existingUsuario.userid,
          username: existingUsuario.username,
          token_access, // Token del superusuario
        },
      });
    }

    // Si el usuario no existe, proceder a crearlo
    const hashedPassword = await hashPassword(password);
    const newUsuario = await Usuario.create({
      username,
      password: hashedPassword,
      superuser_id, // Asignar el superuser_id del token
    });

    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      data: {
        userid: newUsuario.userid,
        username: newUsuario.username,
        token_access, // Token del superusuario
      },
    });
  } catch (error) {
    logger.error("Error al crear el usuario:", error);
    return res.status(500).json({
      message: "Error al crear el usuario.",
      error: error.message || error,
    });
  }
};

module.exports = {
  createUser,
};

// Obtener un nuevo token
const getToken = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al superusuario por su nombre de usuario
    const superUsuario = await SuperUsuario.findOne({ where: { username } });

    // Si el superusuario no existe o la contraseña es incorrecta
    if (superUsuario) {
      // Si ya existe, verificar si la contraseña proporcionada es correcta
      const isPasswordCorrect = await comparePassword(
        password,
        superUsuario.password
      );

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Contraseña incorrecta." });
      }
    }

    let token_access;

    // Verificar si el token del superusuario es válido o ha expirado
    try {
      jwt.verifyToken(superUsuario.token_access); // Verificar si el token es válido
      token_access = superUsuario.token_access; // Si es válido, devolver el mismo token
    } catch (error) {
      // Si el token ha expirado o es inválido, generar uno nuevo
      token_access = jwt.createToken({ id: superUsuario.userid });
      superUsuario.token_access = token_access; // Actualizar el token en la base de datos
      await superUsuario.save();
    }

    return res.status(200).json({
      message: "Autenticación exitosa",
      user: {
        username: superUsuario.username,
        token_access, // Devolver el token (ya sea nuevo o el mismo)
      },
    });
  } catch (error) {
    logger.error("Error al obtener el token:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener el token", error });
  }
};

const createToken = (req, res) => {
  const token = jwt.createToken({ example: "" });
  res.json({ message: `Ruta ${req.originalUrl} funcionando.`, token });
};

module.exports = {
  createSuperUser,
  createUser,
  getToken,
  createToken,
};
