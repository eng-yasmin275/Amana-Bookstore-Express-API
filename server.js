// server.js

const express = require("express");
const helloWorldRouter = require("./routes/helloWorld");
const booksRouter = require("./routes/booksRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

const logger = require("./middleware/logger"); // <-- import logger
app.use(logger); // <-- apply it globally

// Middleware to parse JSON
app.use(express.json());

// Connect routers
app.use("/api/hello", helloWorldRouter);
app.use("/api/books", booksRouter);
app.use("/api/reviews", reviewsRouter); // ✅ Add this line too



// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
