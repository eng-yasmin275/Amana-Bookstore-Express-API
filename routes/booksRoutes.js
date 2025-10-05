// routes/booksRoutes.js

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const authenticate = require("../middleware/auth");


// Path to books.json
const booksFilePath = path.join(__dirname, "../data/books.json");
// Path to reviews.json
const reviewsFilePath = path.join(__dirname, "../data/reviews.json");


// 🟢 GET all books
router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);
    res.json(booksData);
  } catch (error) {
    console.error("❌ Error reading books file:", error);
    res.status(500).json({ error: "Failed to load books data" });
  }
});



// 🟢 GET books published between a date range
router.get("/published", (req, res) => {
  try {
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);

    const { start, end } = req.query; // Get query params from URL

    // Validate that both dates exist
    if (!start || !end) {
      return res.status(400).json({
        error: "Please provide both 'start' and 'end' query parameters in YYYY-MM-DD format",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Filter books by date range
    const filteredBooks = booksData.books.filter((book) => {
      const publishedDate = new Date(book.datePublished);
      return publishedDate >= startDate && publishedDate <= endDate;
    });

    // Handle no results
    if (filteredBooks.length === 0) {
      return res.status(404).json({
        message: "No books found within the specified date range",
      });
    }

    res.json(filteredBooks);
  } catch (error) {
    console.error("❌ Error reading books file:", error);
    res.status(500).json({ error: "Failed to filter books by date range" });
  }
});

// 🟢 GET top 10 rated books (rating × numberOfReviews)
router.get("/top-rated", (req, res) => {
  try {
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);

    // Calculate popularity score for each book
    const booksWithScore = booksData.books.map((book) => ({
      ...book,
      popularityScore: book.rating * book.numberOfReviews,
    }));

    // Sort descending by popularityScore
    const sortedBooks = booksWithScore.sort(
      (a, b) => b.popularityScore - a.popularityScore
    );

    // Take top 10
    const top10Books = sortedBooks.slice(0, 10);

    res.json(top10Books);
  } catch (error) {
    console.error("❌ Error loading top-rated books:", error);
    res.status(500).json({ error: "Failed to load top-rated books" });
  }
});

// 🟢 GET all featured books (featured === true)
router.get("/featured", (req, res) => {
  try {
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);

    // Filter books that are featured
    const featuredBooks = booksData.books.filter((book) => book.featured === true);

    if (featuredBooks.length === 0) {
      return res.status(404).json({ message: "No featured books found" });
    }

    res.json(featuredBooks);
  } catch (error) {
    console.error("❌ Error reading featured books:", error);
    res.status(500).json({ error: "Failed to load featured books" });
  }
});



// 🟢 NEW: GET one book by ID
router.get("/:id", (req, res) => {
  try {
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);

    const bookId = req.params.id; // extract from URL
    const book = booksData.books.find((b) => b.id === bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("❌ Error reading books file:", error);
    res.status(500).json({ error: "Failed to load book data" });
  }
});


// 🟢 GET all reviews for a specific book (by book ID)
router.get("/:id/reviews", (req, res) => {
  try {
    // Read reviews file
    const reviewsData = fs.readFileSync(reviewsFilePath, "utf8");
    const parsedReviews = JSON.parse(reviewsData);

    // Extract book ID from URL
    const bookId = req.params.id;

    // Filter reviews that match this book ID
    const bookReviews = parsedReviews.reviews.filter(
      (review) => review.bookId === bookId
    );

    if (bookReviews.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this book ID",
      });
    }

    res.json({
      bookId: bookId,
      totalReviews: bookReviews.length,
      reviews: bookReviews,
    });
  } catch (error) {
    console.error("❌ Error loading reviews:", error);
    res.status(500).json({ error: "Failed to load book reviews" });
  }
});


// 🟢 POST: Add a new book to the catalogue
router.post("/",authenticate, (req, res) => {
  try {
    const newBook = req.body; // Get book data from request body

    // Validate minimal required fields
    if (!newBook.id || !newBook.title || !newBook.author) {
      return res.status(400).json({ error: "Missing required fields (id, title, author)" });
    }

    // Read existing data
    const data = fs.readFileSync(booksFilePath, "utf8");
    const booksData = JSON.parse(data);

    // Check for duplicate ID
    const exists = booksData.books.find((b) => b.id === newBook.id);
    if (exists) {
      return res.status(400).json({ error: "Book with this ID already exists" });
    }

    // Add new book to array
    booksData.books.push(newBook);

    // Save updated data to file
    fs.writeFileSync(booksFilePath, JSON.stringify(booksData, null, 2));

    res.status(201).json({
      message: "✅ New book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("❌ Error adding new book:", error);
    res.status(500).json({ error: "Failed to add new book" });
  }
});


// 🟢 POST: Add a new review for a specific book
router.post("/:id/reviews",authenticate, (req, res) => {
  try {
    const bookId = req.params.id;
    const newReview = req.body;

    // ✅ Basic validation
    if (!newReview.id || !newReview.author || !newReview.rating || !newReview.comment) {
      return res.status(400).json({
        error: "Missing required fields (id, author, rating, comment)",
      });
    }

    // Read the reviews file
    const data = fs.readFileSync(reviewsFilePath, "utf8");
    const reviewsData = JSON.parse(data);

    // Assign bookId automatically (to prevent user mismatch)
    newReview.bookId = bookId;
    newReview.timestamp = new Date().toISOString();

    // Add the review to the array
    reviewsData.reviews.push(newReview);

    // Save updated file
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviewsData, null, 2));

    res.status(201).json({
      message: "✅ New review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("❌ Error adding new review:", error);
    res.status(500).json({ error: "Failed to add new review" });
  }
});



module.exports = router;

