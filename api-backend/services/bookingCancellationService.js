const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Departure = require("../models/Departure");

async function cancelBookingById(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID.");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findOne({
      _id: bookingId,
      ...(userId ? { user: userId } : {}),
    }).session(session);

    if (!booking) {
      const error = new Error("Booking not found.");
      error.statusCode = 404;
      throw error;
    }

    if (booking.status === "cancelled") {
      const error = new Error("This booking has already been cancelled.");
      error.statusCode = 400;
      throw error;
    }

    if (booking.status === "completed") {
      const error = new Error("A completed booking cannot be cancelled.");
      error.statusCode = 400;
      throw error;
    }

    const departure = await Departure.findById(booking.departure).session(session);

    if (!departure) {
      const error = new Error("The departure associated with this booking could not be found.");
      error.statusCode = 404;
      throw error;
    }

    departure.bookedSeats = Math.max(0, departure.bookedSeats - booking.travelers);

    if (departure.status !== "cancelled" && departure.bookedSeats < departure.capacity) {
      departure.status = "open";
    }

    await departure.save({ session });

    booking.status = "cancelled";
    await booking.save({ session });

    await session.commitTransaction();

    return Booking.findById(booking._id)
      .populate("tourPackage", "title description imageUrl duration pricePerPerson")
      .populate("departure", "departureDate capacity bookedSeats status");
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = { cancelBookingById };
