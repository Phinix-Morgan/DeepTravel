const CustomTripRequest = require("../models/CustomTripRequest");
const TourPackage = require("../models/TourPackage");

// --------------------------------------------------
// Create Custom Trip Request
// --------------------------------------------------

const createCustomTripRequest = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      tourPackage,
      preferredStartDate,
      travelers,
      requestedDuration,
      itineraryChanges,
      accommodationPreferences,
      transportationPreferences,
      additionalActivities,
      customerMessage,
    } = req.body;

    // --------------------------------------------------
    // Validate required fields
    // --------------------------------------------------

    if (
      !tourPackage ||
      !preferredStartDate ||
      !travelers
    ) {
      return res.status(400).json({
        message:
          "Tour package, preferred start date, and number of travelers are required.",
      });
    }

    // --------------------------------------------------
    // Validate travelers
    // --------------------------------------------------

    if (
      !Number.isInteger(travelers) ||
      travelers < 1
    ) {
      return res.status(400).json({
        message:
          "Number of travelers must be at least 1.",
      });
    }

    // --------------------------------------------------
    // Validate package
    // --------------------------------------------------

    const packageData =
      await TourPackage.findById(tourPackage);

    if (!packageData) {
      return res.status(404).json({
        message: "Tour package not found.",
      });
    }

    if (packageData.status !== "active") {
      return res.status(400).json({
        message:
          "This tour package is not currently available.",
      });
    }

    // --------------------------------------------------
    // Validate date
    // --------------------------------------------------

    const startDate = new Date(
      preferredStartDate
    );

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        message:
          "Please provide a valid preferred start date.",
      });
    }

    if (startDate < new Date()) {
      return res.status(400).json({
        message:
          "Preferred start date must be in the future.",
      });
    }

    // --------------------------------------------------
    // Validate requested duration
    // --------------------------------------------------

    if (requestedDuration) {
      if (
        requestedDuration.days !== undefined &&
        (!Number.isInteger(
          requestedDuration.days
        ) ||
          requestedDuration.days < 1)
      ) {
        return res.status(400).json({
          message:
            "Requested duration days must be at least 1.",
        });
      }

      if (
        requestedDuration.nights !== undefined &&
        (!Number.isInteger(
          requestedDuration.nights
        ) ||
          requestedDuration.nights < 0)
      ) {
        return res.status(400).json({
          message:
            "Requested duration nights cannot be negative.",
        });
      }
    }

    // --------------------------------------------------
    // Prevent duplicate active requests
    // --------------------------------------------------

    const existingRequest =
      await CustomTripRequest.findOne({
        user: userId,
        tourPackage,
        status: {
          $in: [
            "pending",
            "reviewing",
            "quoted",
          ],
        },
      });

    if (existingRequest) {
      return res.status(409).json({
        message:
          "You already have an active custom trip request for this package.",
        requestId: existingRequest._id,
      });
    }

    // --------------------------------------------------
    // Create request
    // --------------------------------------------------

    const customTripRequest =
      await CustomTripRequest.create({
        user: userId,
        tourPackage,
        preferredStartDate: startDate,
        travelers,
        requestedDuration,
        itineraryChanges,
        accommodationPreferences,
        transportationPreferences,
        additionalActivities,
        customerMessage,
      });

    // --------------------------------------------------
    // Return populated request
    // --------------------------------------------------

    const populatedRequest =
      await CustomTripRequest.findById(
        customTripRequest._id
      ).populate(
        "tourPackage",
        "title description imageUrl duration pricePerPerson"
      );

    return res.status(201).json({
      message:
        "Custom trip request submitted successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create custom trip request error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while creating the custom trip request.",
    });
  }
};

// --------------------------------------------------
// Get Current User's Custom Trip Requests
// --------------------------------------------------

const getMyCustomTripRequests = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const requests =
      await CustomTripRequest.find({
        user: userId,
      })
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get custom trip requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving your custom trip requests.",
    });
  }
};

// --------------------------------------------------
// Get Single Custom Trip Request
// --------------------------------------------------

const getCustomTripRequestById = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const request =
      await CustomTripRequest.findOne({
        _id: id,
        user: userId,
      })
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson itinerary inclusions exclusions"
        );

    if (!request) {
      return res.status(404).json({
        message:
          "Custom trip request not found.",
      });
    }

    return res.status(200).json({
      request,
    });
  } catch (error) {
    console.error(
      "Get custom trip request error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving the custom trip request.",
    });
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  createCustomTripRequest,
  getMyCustomTripRequests,
  getCustomTripRequestById,
};