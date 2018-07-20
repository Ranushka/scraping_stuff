var winston = require('winston');
// var path = require('path');

// Set this to whatever, by default the path of the script.
// const errorFile = path.join(__dirname, 'logs/error.log');
// const infoFile = path.join(__dirname, 'logs/info.log');


// try {
//   fs.unlinkSync(errorFile);
//   fs.unlinkSync(infoFile);
// } catch (ex) {}

// module.exports = winston.createLogger({
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: infoFile,
//       filters: [function (level, msg, meta) {
//         return (level === 'info') ? msg : '';
//       }]
//     })
//   ]
// });


/* LOGGER EXAMPLES
  var log = require('./logger.js')
  log.trace('testing')
  log.debug('testing')
  log.info('testing')
  log.warn('testing')
  log.crit('testing')
  log.fatal('testing')
 */

const fs = require('fs');
const {
  createLogger,
  format,
  transports
} = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.simple()
      )
    }),
    new winston.transports.File({
      filename: './logs/info.log',
      level: 'info'
    })
  ]
})

module.exports = logger


// logger.log({
//   level: 'info',
//   message: 'Check example.log – it will have no colors!'
// });


// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File({
//       filename: 'combined.log',
//       level: 'info'
//     }),
//     new winston.transports.File({
//       filename: 'errors.log',
//       level: 'error'
//     })
//   ]
// });





// var winston = require('winston')

// // set default log level.
// var logLevel = 'info'

// // Set up logger
// var customColors = {
//   trace: 'white',
//   debug: 'green',
//   info: 'blue',
//   warn: 'yellow',
//   crit: 'red',
//   fatal: 'red'
// }

// var logger = new(winston.Logger)({
//   colors: customColors,
//   level: logLevel,
//   levels: {
//     fatal: 0,
//     crit: 1,
//     warn: 2,
//     info: 3,
//     debug: 4,
//     trace: 5
//   },
//   transports: [
//     new(winston.transports.Console)({
//       colorize: true,
//       timestamp: true
//     }),
//     new(winston.transports.File)({
//       filename: 'somefile.log'
//     })
//   ]
// })

// winston.addColors(customColors)

// // Extend logger object to properly log 'Error' types
// var origLog = logger.log

// logger.log = function (level, msg) {
//   if (msg instanceof Error) {
//     var args = Array.prototype.slice.call(arguments)
//     args[1] = msg.stack
//     origLog.apply(logger, args)
//   } else {
//     origLog.apply(logger, arguments)
//   }
// }


// module.exports = logger
