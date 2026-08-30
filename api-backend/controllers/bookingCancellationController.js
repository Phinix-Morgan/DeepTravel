const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Departure = require("../models/Departure");

// --------------------------------------------------
// Cancel Booking
// --------------------------------------------------

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.userId;
    const { id } = req.params;

    session.startTransaction();

    // --------------------------------------------------
    // Find user's booking
    // --------------------------------------------------

    const booking =
      await Booking.findOne({
        _id: id,
        user: userId,
      }).session(session);

    if (!booking) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Booking not found.",
      });
    }

    // --------------------------------------------------
    // Validate booking status
    // --------------------------------------------------

    if (booking.status === "cancelled") {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This booking has already been cancelled.",
      });
    }

    if (booking.status === "completed") {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "A completed booking cannot be cancelled.",
      });
    }

    // --------------------------------------------------
    // Find departure
    // --------------------------------------------------

    const departure =
      await Departure.findById(
        booking.departure
      ).session(session);

    if (!departure) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "The departure associated with this booking could not be found.",
      });
    }

    // --------------------------------------------------
    // Release booked seats
    // --------------------------------------------------

    departure.bookedSeats = Math.max(
      0,
      departure.bookedSeats -
        booking.travelers
    );

    // If the departure was full/closed because
    // of capacity, make it open again when seats
    // become available.
    if (
      departure.status !== "cancelled" &&
      departure.bookedSeats <
        departure.capacity
    ) {
      departure.status = "open";
    }

    await departure.save({
      session,
    });

    // --------------------------------------------------
    // Cancel booking
    // --------------------------------------------------

    booking.status = "cancelled";

    await booking.save({
      session,
    });

    // --------------------------------------------------
    // Commit transaction
    // --------------------------------------------------

    await session.commitTransaction();

    // --------------------------------------------------
    // Return updated booking
    // --------------------------------------------------

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        );

    return res.status(200).json({
      message:
        "Booking cancelled successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Cancel booking error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while cancelling the booking.",
    });
  } finally {
    await session.endSession();
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  cancelBooking,
};