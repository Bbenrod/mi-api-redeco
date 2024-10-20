const loggerHandler = (req, res, next) => {
  const timestamp = Date().toLocaleString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = loggerHandler;
