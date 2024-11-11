const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Retorna el contenido decodificado si el token es válido
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new jwt.TokenExpiredError(
        'El token ha expirado. Por favor, renueva tu token.'
      ); // Mensaje específico para expiración
    }
    throw new Error('Token inválido.'); // Mensaje para otros errores de verificación
  }
};

module.exports = {
  createToken,
  verifyToken,
};
