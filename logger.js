// Import the winston logging library
const winston = require("winston");

// Create a logger instance with colorized output and custom format
const logger = winston.createLogger({
  level: "info", // Log level
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message }) => {
      return `${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Output logs to the console
  ],
});

// Export the logger instance
module.exports = logger; 