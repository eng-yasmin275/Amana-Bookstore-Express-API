// routes/helloWorld.js

const express = require("express");  // Import express
const router = express.Router();     // Create a router object

// Define a simple GET route for "/"
router.get("/", (req, res) => {
  res.send("Hello, World! 🌍 from Amana Bookstore API");
});

// Export the router so it can be used in server.js
module.exports = router;
