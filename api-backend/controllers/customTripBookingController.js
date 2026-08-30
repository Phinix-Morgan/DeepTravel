const mongoose = require("mongoose");

const CustomTripRequest = require("../models/CustomTripRequest");
const Booking = require("../models/Booking");
const Departure = require("../models/Departure");

// --------------------------------------------------
// Accept Custom Trip Quote & Create Booking
// --------------------------------------------------

const acceptCustomTripQuote = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { departure } = req.body;

    if (!departure) {
      return res.status(400).json({
        message:
          "Departure is required to accept the custom trip quote.",
      });
    }

    session.startTransaction();

    // --------------------------------------------------
    // Find customer's custom trip request
    // --------------------------------------------------

    const customTripRequest =
      await CustomTripRequest.findOne({
        _id: id,
        user: userId,
      }).session(session);

    if (!customTripRequest) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Custom trip request not found.",
      });
    }

    // --------------------------------------------------
    // Validate request status
    // --------------------------------------------------

    if (customTripRequest.status !== "quoted") {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Only quoted custom trip requests can be accepted.",
      });
    }

    // --------------------------------------------------
    // Prevent duplicate booking
    // --------------------------------------------------

    if (customTripRequest.booking) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "This custom trip request has already been converted into a booking.",
        bookingId:
          customTripRequest.booking,
      });
    }

    // --------------------------------------------------
    // Validate quote expiration
    // --------------------------------------------------

    if (
      customTripRequest.quoteExpiresAt &&
      customTripRequest.quoteExpiresAt <= new Date()
    ) {
      customTripRequest.status = "expired";

      await customTripRequest.save({
        session,
      });

      await session.commitTransaction();

      return res.status(400).json({
        message:
          "This custom trip quote has expired.",
      });
    }

    // --------------------------------------------------
    // Validate quote
    // --------------------------------------------------

    if (
      customTripRequest.quotedPricePerPerson === null ||
      customTripRequest.quotedTotalPrice === null
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This custom trip does not have a valid quotation.",
      });
    }

    // --------------------------------------------------
    // Find departure
    // --------------------------------------------------

    const departureData =
      await Departure.findById(
        departure
      ).session(session);

    if (!departureData) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Departure not found.",
      });
    }

    // --------------------------------------------------
    // Verify departure belongs to package
    // --------------------------------------------------

    if (
      departureData.tourPackage.toString() !==
      customTripRequest.tourPackage.toString()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Selected departure does not belong to the requested tour package.",
      });
    }

    // --------------------------------------------------
    // Validate departure status
    // --------------------------------------------------

    if (departureData.status !== "open") {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Selected departure is not currently open for booking.",
      });
    }

    // --------------------------------------------------
    // Validate departure capacity
    // --------------------------------------------------

    const remainingSeats =
      departureData.capacity -
      departureData.bookedSeats;

    if (
      remainingSeats <
      customTripRequest.travelers
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Not enough seats are available for this departure.",
        remainingSeats,
        requestedSeats:
          customTripRequest.travelers,
      });
    }

    // --------------------------------------------------
    // Create Booking
    // --------------------------------------------------

    const booking =
      await Booking.create(
        [
          {
            user: userId,
            tourPackage:
              customTripRequest.tourPackage,
            departure:
              departureData._id,
            travelers:
              customTripRequest.travelers,
            pricePerPersonAtBooking:
              customTripRequest.quotedPricePerPerson,
            totalPrice:
              customTripRequest.quotedTotalPrice,
            status: "pending",
          },
        ],
        {
          session,
        }
      );

    // --------------------------------------------------
    // Update Departure Seats
    // --------------------------------------------------

    departureData.bookedSeats +=
      customTripRequest.travelers;

    await departureData.save({
      session,
    });

    // --------------------------------------------------
    // Link Booking to Custom Trip Request
    // --------------------------------------------------

    customTripRequest.booking =
      booking[0]._id;

    customTripRequest.status =
      "accepted";

    await customTripRequest.save({
      session,
    });

    // --------------------------------------------------
    // Commit Transaction
    // --------------------------------------------------

    await session.commitTransaction();

    // --------------------------------------------------
    // Populate Booking for Response
    // --------------------------------------------------

    const populatedBooking =
      await Booking.findById(
        booking[0]._id
      )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        );

    return res.status(201).json({
      message:
        "Custom trip quote accepted and booking created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Accept custom trip quote error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while accepting the custom trip quote.",
    });
  } finally {
    await session.endSession();
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  acceptCustomTripQuote,
};
