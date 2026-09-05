const mongoose = require("mongoose");

const Departure = require("../models/Departure");
const TourPackage = require("../models/TourPackage");

// --------------------------------------------------
// Get Available Departures For A Tour Package
// --------------------------------------------------

const getDeparturesByPackage = async (
  req,
  res
) => {
  try {
    const { packageId } =
      req.params;

    // --------------------------------------------------
    // Validate Package ID
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        packageId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid tour package ID.",
      });
    }

    // --------------------------------------------------
    // Verify Tour Package Exists
    // --------------------------------------------------

    const tourPackage =
      await TourPackage.findById(
        packageId
      ).select("_id status");

    if (!tourPackage) {
      return res.status(404).json({
        message:
          "Tour package not found.",
      });
    }

    // --------------------------------------------------
    // Package Must Be Active
    // --------------------------------------------------

    if (
      tourPackage.status !==
      "active"
    ) {
      return res.status(400).json({
        message:
          "This tour package is not currently available.",
      });
    }

    // --------------------------------------------------
    // Fetch Available Future Departures
    // --------------------------------------------------

    const departures =
      await Departure.find({
        tourPackage: packageId,

        status: "open",

        departureDate: {
          $gt: new Date(),
        },

        $expr: {
          $lt: [
            "$bookedSeats",
            "$capacity",
          ],
        },
      })
        .sort({
          departureDate: 1,
        })
        .lean();

    // --------------------------------------------------
    // Add Remaining Seats
    // --------------------------------------------------

    const departuresWithAvailability =
      departures.map(
        (departure) => ({
          ...departure,

          remainingSeats:
            Math.max(
              departure.capacity -
                departure.bookedSeats,
              0
            ),
        })
      );

    return res.status(200).json({
      departures:
        departuresWithAvailability,
    });
  } catch (error) {
    console.error(
      "Get package departures error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch available departures.",
    });
  }
};


// --------------------------------------------------
// Get Single Departure
// --------------------------------------------------

const getDepartureById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid departure ID.",
      });
    }

    // --------------------------------------------------
    // Fetch Departure
    // --------------------------------------------------

    const departure =
      await Departure.findById(id)
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson groupLimit status"
        )
        .lean();

    if (!departure) {
      return res.status(404).json({
        message:
          "Departure not found.",
      });
    }

    // --------------------------------------------------
    // Calculate Remaining Seats
    // --------------------------------------------------

    const remainingSeats =
      Math.max(
        departure.capacity -
          departure.bookedSeats,
        0
      );

    return res.status(200).json({
      departure: {
        ...departure,
        remainingSeats,
      },
    });
  } catch (error) {
    console.error(
      "Get departure error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch departure.",
    });
  }
};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  getDeparturesByPackage,
  getDepartureById,
};