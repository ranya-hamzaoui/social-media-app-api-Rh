const winston = require("winston");
require("winston-daily-rotate-file");
let config = require("../config/server");
let path = require("path");
const { createLogger, format, transports } = require("winston");
const fs = require('fs')

// Define the logs directory
const logDirectory = config.logsDir;

// Check if the directory exists, if not, create it
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = createLogger({
  level: config.debugLogging ? "debug" : "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({
      stack: true
    }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: "DPA-WEB-SERVER"
  },
  transports: [
    //
    // - Write to all logs with level `info` and below to `default.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.DailyRotateFile({
      name: "file#info",
      level: "info",
      maxSize: '20m',
      maxFiles: "1d",
      filename: path.join(config.logsDir, "info.log"),
      datePattern: "YYYY-MM-DD",
      auditFile: path.join(config.logsDir, "application-audit.json"),
      zippedArchive: true
    }),
    new winston.transports.DailyRotateFile({
      name: "file#error",
      level: "error",
      maxSize: '20m',
      maxFiles: "1d",
      filename: path.join(config.logsDir, "error.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      auditFile: path.join(config.logsDir, "application-audit.json"),
      handleExceptions: true
    })
  ]
});

if (config.nodeEnv !== "production") {
  logger.add(
    new transports.Console({
      level: "debug",
      stderrLevels: ["error", "debug", "info"],
      consoleWarnLevels: ["warn"],
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(msg => `${msg.timestamp} - ${msg.level}: ${msg.message}`)
      )
    })
  );
  logger.debug("Logging initialized at debug level");
}

logger.stream = {
  
 write: function(message) {
    logger.info(message.trim());
  }

};
module.exports = logger;