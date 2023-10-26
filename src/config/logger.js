const  winston = require('winston');
// const { format, createLogger, transports } = require("winston");
const {format} = require("winston");
  require('winston-daily-rotate-file');


/**
 * Logger handles all logs in the application
 */
const logger = winston.createLogger({
  format: format.combine(format.timestamp(), format.simple()),
  colorize: true,
  transports: [
    new winston.transports.File({
      filename: 'logs/server/error.log',
      level: 'error',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: 'logs/server/all.log',
      level: 'info',
      handleExceptions: true
    }),
    new winston.transports.DailyRotateFile({
      maxFiles: '14d',
      level: 'info',
      dirname: 'logs/server/daily',
      datePattern: 'YYYY-MM-DD',
      filename: '%DATE%.log'
    }),
    new winston.transports.Console({
      level: 'debug',
      json: false,
      handleExceptions: true
    })
  ]
});

/**
 * morganLogger logs all http request in a dedicated file and on console
 */
const morganLogger = winston.createLogger({
  format: format.combine(format.simple()),
  transports: [
    new winston.transports.File({
      filename: 'logs/requests/all.log',
      level: 'debug',
      handleExceptions: true
    }),
    new winston.transports.Console({
      level: 'debug',
      json: false,
      handleExceptions: true
    }),
    new winston.transports.DailyRotateFile({
      maxFiles: '14d',
      level: 'info',
      dirname: 'logs/requests/daily',
      datePattern: 'YYYY-MM-DD',
      filename: '%DATE%.log'
    })
  ]
});

 const logStream = {
  /**
   * A writable stream for winston logger.
   *
   * @param {any} message
   */
  write(message) {
    morganLogger.info(message.toString());
  }
};

// const allerror = {
// logger,
// logStream
// }



module.exports = logger
