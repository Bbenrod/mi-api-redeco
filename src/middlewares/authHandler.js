const jwt = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const bearerToken = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token;
    const verified = jwt.verifyToken(bearerToken);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message:
          "Token expirado. Por favor, renueva tu token en /auth/users/token",
      });
    }
    return res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = {
  authMiddleware,
};
