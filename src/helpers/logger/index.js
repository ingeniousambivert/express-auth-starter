const { createLogger, format, transports } = require("winston");

const logConfiguration = {
  transports: [
    new transports.Console({
      level: "error",
    }),
    new transports.File({
      filename: "logs/server.log",
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (logInfo) =>
            `${logInfo.level}: ${[logInfo.timestamp]}: ${logInfo.message}`
        )
      ),
    }),
  ],
};

module.exports = createLogger(logConfiguration);
