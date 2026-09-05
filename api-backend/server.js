require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const destinationRoutes = require("./routes/destinations");
const packageRoutes = require("./routes/packages");
const authRoutes = require("./routes/auth");
const customTripRoutes = require("./routes/customTrips");
const customTripBookingRoutes = require("./routes/customTripBooking");
const adminCustomTripRoutes = require("./routes/adminCustomTrips");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");

const departureRoutes =
  require("./routes/departures");

const app = express();

// --------------------------------------------------
// Security Middleware
// --------------------------------------------------

app.use(helmet());

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",

    credentials: true,
  })
);



// --------------------------------------------------
// General Middleware
// --------------------------------------------------

app.use(express.json());

// Parse HTTP cookies
app.use(cookieParser());

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
    message:
      "Hello from DeepTravel API! 🚀",
  });
});

// --------------------------------------------------
// Authentication Routes
// --------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);

// --------------------------------------------------
// Destination Routes
// --------------------------------------------------

app.use(
  "/api/destinations",
  destinationRoutes
);

// --------------------------------------------------
// Tour Package Routes
// --------------------------------------------------

app.use(
  "/api/packages",
  packageRoutes
);

// --------------------------------------------------
// Departure Routes
// --------------------------------------------------

app.use(
  "/api/departures",
  departureRoutes
);

// --------------------------------------------------
// Custom Trip Routes
// --------------------------------------------------

app.use(
  "/api/custom-trips",
  customTripRoutes
);

// --------------------------------------------------
// Custom Trip Booking Routes
// --------------------------------------------------

app.use(
  "/api/custom-trips",
  customTripBookingRoutes
);

// --------------------------------------------------
// Admin Custom Trip Routes
// --------------------------------------------------

app.use(
  "/api/admin/custom-trips",
  adminCustomTripRoutes
);

// --------------------------------------------------
// Booking Routes
// --------------------------------------------------

app.use(
  "/api/bookings",
  bookingRoutes
);

// --------------------------------------------------
// Payment Routes
// --------------------------------------------------

app.use(
  "/api/payments",
  paymentRoutes
);

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message:
      "API endpoint not found.",
  });
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong on the server.",
    });
  }
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

  console.log(
    `Frontend origin: ${
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    }`
  );
});