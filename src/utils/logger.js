const logger = (message, type = "info", logger = console.log) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}]: ${message}\n`;

  // Mostrar el log en consola
  logger(logMessage);
};

module.exports = {
  info: (message) => logger(message),
  error: (message) => logger(message, "error", console.error),
};
