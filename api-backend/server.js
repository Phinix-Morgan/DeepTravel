require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// Health Check
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message: "DeepTravel API is running",
  });
});

// ============================================================
// MongoDB Connection
// ============================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:");
    console.error(error.message);
  });

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(`DeepTravel API running on port ${PORT}`);
});
