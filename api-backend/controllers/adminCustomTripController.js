const CustomTripRequest = require("../models/CustomTripRequest");
const User = require("../models/User");
const TourPackage = require("../models/TourPackage");
const Booking = require("../models/Booking");

// --------------------------------------------------
// Get All Custom Trip Requests
// --------------------------------------------------

const getAllCustomTripRequests = async (req, res) => {
  try {
    const requests = await CustomTripRequest.find()
      .populate(
        "user",
        "name email"
      )
      .populate(
        "tourPackage",
        "title description imageUrl duration pricePerPerson"
      )
      .populate(
        "booking",
        "travelers totalPrice status"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get all custom trip requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving custom trip requests.",
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
    const { id } = req.params;

    const request =
      await CustomTripRequest.findById(id)
        .populate(
          "user",
          "name email"
        )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson itinerary inclusions exclusions"
        )
        .populate(
          "booking",
          "travelers pricePerPersonAtBooking totalPrice status"
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
// Update Custom Trip Request Status
// --------------------------------------------------

const updateCustomTripRequestStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewing",
      "quoted",
      "accepted",
      "rejected",
      "expired",
      "cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid custom trip request status.",
      });
    }

    const request =
      await CustomTripRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message:
          "Custom trip request not found.",
      });
    }

    request.status = status;

    await request.save();

    const updatedRequest =
      await CustomTripRequest.findById(
        request._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        );

    return res.status(200).json({
      message:
        "Custom trip request status updated successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Update custom trip request status error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while updating the custom trip request status.",
    });
  }
};

// --------------------------------------------------
// Create / Update Custom Trip Quote
// --------------------------------------------------

const updateCustomTripQuote = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      quotedPricePerPerson,
      adminNotes,
      quoteExpiresAt,
    } = req.body;

    // --------------------------------------------------
    // Validate price
    // --------------------------------------------------

    if (
      quotedPricePerPerson === undefined ||
      quotedPricePerPerson === null
    ) {
      return res.status(400).json({
        message:
          "Quoted price per person is required.",
      });
    }

    if (
      typeof quotedPricePerPerson !== "number" ||
      !Number.isFinite(quotedPricePerPerson) ||
      quotedPricePerPerson < 0
    ) {
      return res.status(400).json({
        message:
          "Quoted price per person must be a valid non-negative number.",
      });
    }

    // --------------------------------------------------
    // Find request
    // --------------------------------------------------

    const request =
      await CustomTripRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message:
          "Custom trip request not found.",
      });
    }

    // --------------------------------------------------
    // Don't modify completed/cancelled requests
    // --------------------------------------------------

    if (
      request.status === "accepted" ||
      request.status === "rejected" ||
      request.status === "cancelled"
    ) {
      return res.status(400).json({
        message:
          "A finalized custom trip request cannot be re-quoted.",
      });
    }

    // --------------------------------------------------
    // Calculate total quote
    // --------------------------------------------------

    const quotedTotalPrice =
      quotedPricePerPerson *
      request.travelers;

    // --------------------------------------------------
    // Validate quote expiration
    // --------------------------------------------------

    let expiresAt = null;

    if (quoteExpiresAt) {
      expiresAt = new Date(
        quoteExpiresAt
      );

      if (Number.isNaN(expiresAt.getTime())) {
        return res.status(400).json({
          message:
            "Please provide a valid quote expiration date.",
        });
      }

      if (expiresAt <= new Date()) {
        return res.status(400).json({
          message:
            "Quote expiration date must be in the future.",
        });
      }
    }

    // --------------------------------------------------
    // Update quote
    // --------------------------------------------------

    request.quotedPricePerPerson =
      quotedPricePerPerson;

    request.quotedTotalPrice =
      quotedTotalPrice;

    request.adminNotes =
      adminNotes !== undefined
        ? adminNotes
        : request.adminNotes;

    request.quoteExpiresAt =
      expiresAt;

    request.status = "quoted";

    await request.save();

    // --------------------------------------------------
    // Return updated request
    // --------------------------------------------------

    const updatedRequest =
      await CustomTripRequest.findById(
        request._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        );

    return res.status(200).json({
      message:
        "Custom trip quote updated successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Update custom trip quote error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while updating the custom trip quote.",
    });
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  getAllCustomTripRequests,
  getCustomTripRequestById,
  updateCustomTripRequestStatus,
  updateCustomTripQuote,
};