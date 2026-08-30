require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const customTripRoutes = require("./routes/customTrips");
const customTripBookingRoutes = require("./routes/customTripBooking");
const adminCustomTripRoutes = require("./routes/adminCustomTrips");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");

const app = express();

// --------------------------------------------------
// Security Middleware
// --------------------------------------------------

app.use(helmet());

// --------------------------------------------------
// General Middleware
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
    console.error(
      "MongoDB connection failed:",
      error
    );
  });

// --------------------------------------------------
// Health Check
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

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/custom-trips",
  customTripRoutes
);

app.use(
  "/api/custom-trips",
  customTripBookingRoutes
);

app.use(
  "/api/admin/custom-trips",
  adminCustomTripRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `DeepTravel API running on port ${PORT}`
  );
});
