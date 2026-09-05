const express = require("express");

const {
  getDestinations,
  getDestinationById,
} = require("../controllers/destinationController");

const router = express.Router();

// --------------------------------------------------
// Public Destination Routes
// --------------------------------------------------

// Get all destinations
router.get(
  "/",
  getDestinations
);

// Get a single destination
router.get(
  "/:id",
  getDestinationById
);

module.exports = router;