const winston = require('winston');

winston.emitErrs = true;

exports.loggerInit = (env) => {
  let ret;

  if (env === 'production') {
    ret = new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'error',
          handleExceptions: true,
          json: false,
          colorize: true,
        }),
        new winston.transports.File({
          level: 'info',
          filename: './server.log',
          handleExceptions: true,
          json: true,
          maxsize: 5242880, // 5MB
          maxFiles: 100,
          colorize: true,
        }),
      ],
      exitOnError: false,
    });
  } else if (env === 'development') {
    return new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true,
        }),
      ],
      exitOnError: false,
    });
  } else if (env === 'test') {
    ret = new winston.Logger({
      transports: [
        new winston.transports.File({
          level: 'info',
          filename: './test.log',
          handleExceptions: true,
          json: true,
          maxsize: 5242880, // 5MB
          maxFiles: 50,
          colorize: false,
        }),
      ],
      exitOnError: false,
    });
  } else {
    // Else return default logger
    return new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true,
        }),
      ],
      exitOnError: false,
    });
  }

  ret.stream = {
    // eslint-disable-next-line no-unused-vars
    write: (message, encoding) => {
      logger.info(message);
    },
  };

  return ret;
};
