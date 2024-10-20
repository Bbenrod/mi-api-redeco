const express = require('express');
const loggerHandler = require('./loggerHandler');
const errorHandler = require('./errorHandler');

const middlewares = express.Router();
middlewares.use(loggerHandler);
middlewares.use(errorHandler);

module.exports = middlewares;
