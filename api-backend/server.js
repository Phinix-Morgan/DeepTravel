require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Database
// --------------------------------------------------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "DeepTravel API is running",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from DeepTravel API! 🚀",
  });
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);

// --------------------------------------------------
// Start server
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DeepTravel API running on port ${PORT}`);
});
