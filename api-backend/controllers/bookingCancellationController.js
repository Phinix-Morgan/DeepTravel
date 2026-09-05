const { cancelBookingById } = require("../services/bookingCancellationService");

// --------------------------------------------------
// Cancel Booking
// --------------------------------------------------

const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updatedBooking = await cancelBookingById(id, userId);

    return res.status(200).json({
      message:
        "Booking cancelled successfully.",
      booking: updatedBooking,
    });
  } catch (error) {

    console.error(
      "Cancel booking error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Something went wrong while cancelling the booking.",
    });
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  cancelBooking,
};
