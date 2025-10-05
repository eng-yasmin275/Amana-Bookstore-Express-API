// middleware/logger.js
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Create a write stream (append mode)
const logStream = fs.createWriteStream(
  path.join(__dirname, "../logging/log.txt"),
  { flags: "a" } // 'a' means append
);

// Define the logging format
// Example: [2025-10-05T19:24:00Z] GET /api/books 200 - 15.2 ms
morgan.token("time", () => new Date().toISOString());
const format =
  '[:time] :method :url :status :res[content-length] - :response-time ms';

// Create and export the middleware
const logger = morgan(format, { stream: logStream });

module.exports = logger;
