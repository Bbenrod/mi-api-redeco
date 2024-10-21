const logger = require("../utils/logger");

const loggerHandler = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

module.exports = loggerHandler;
