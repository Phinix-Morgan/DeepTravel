require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API Running " });
});

app.use("/api/auth", authRoutes);

// Add this right underneath your existing app.use("/api/auth", ...) line!
app.use("/api/destinations", require("./routes/destinations"));

// Add this under your app.use("/api/destinations", ...) line!
app.use("/api/trips", require("./routes/trips"));

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the Backend! 🚀" });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
