// middleware/auth.js
const fs = require("fs");
const path = require("path");

// Path to log file
const logFilePath = path.join(__dirname, "../logging/log.txt");

function logAttempt(status, apiKey, route) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] [${status}] API Key: ${apiKey || "none"} | Route: ${route}\n`;

  fs.appendFileSync(logFilePath, message, "utf8");
}

function authenticate(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const VALID_API_KEY = "amana-secret-2025";

  if (apiKey === VALID_API_KEY) {
    // ✅ Successful authentication
    logAttempt("SUCCESS", apiKey, req.originalUrl);
    next();
  } else {
    // 🚫 Failed authentication
    logAttempt("FAIL", apiKey, req.originalUrl);
    res.status(403).json({
      error: "Access denied: invalid or missing API key",
    });
  }
}

module.exports = authenticate;
