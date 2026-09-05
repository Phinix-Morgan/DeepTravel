const express = require("express");

const {
  getDeparturesByPackage,
  getDepartureById,
} = require(
  "../controllers/departureController"
);

const router = express.Router();

// --------------------------------------------------
// Get Available Departures For Package
// --------------------------------------------------

// GET /api/departures/package/:packageId
router.get(
  "/package/:packageId",
  getDeparturesByPackage
);

// --------------------------------------------------
// Get Single Departure
// --------------------------------------------------

// GET /api/departures/:id
router.get(
  "/:id",
  getDepartureById
);

module.exports = router;