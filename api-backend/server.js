require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const destinationRoutes = require("./routes/destinations");
const tripRoutes = require("./routes/trips");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API Running" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the Backend! 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));