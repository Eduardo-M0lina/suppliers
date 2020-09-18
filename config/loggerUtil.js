const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.label({ label: "UploadFiles" }),
    winston.format.timestamp(),
    winston.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    winston.format.colorize(),
    winston.format.printf((info) => {
      let out = `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
      if (info.metadata.error) {
        out = `${out} ${info.metadata.error}`;
        if (info.metadata.error.stack) {
          out = `${out} ${info.metadata.error.stack}`;
        }
      }
      return out;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    //loggingWinston,
  ],
});

module.exports = logger;
