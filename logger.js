var winston = require('winston');
var path = require('path');

// Set this to whatever, by default the path of the script.
const errorFile = path.join(__dirname, 'logs/error.log');
const infoFile = path.join(__dirname, 'logs/info.log');


try {
  fs.unlinkSync(errorFile);
  fs.unlinkSync(infoFile);
} catch (ex) {}

module.exports = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: infoFile,
      filters: [function (level, msg, meta) {
        return (level === 'info') ? msg : '';
      }]
    })
  ]
});
