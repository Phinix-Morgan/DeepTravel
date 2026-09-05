const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const TourPackage = require("../models/TourPackage");
const Departure = require("../models/Departure");

// --------------------------------------------------
// Create Normal Tour Package Booking
// --------------------------------------------------

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.userId;

    const {
      tourPackage,
      departure,
      travelers,
    } = req.body;

    // --------------------------------------------------
    // Validate input
    // --------------------------------------------------

    if (!tourPackage) {
      return res.status(400).json({
        message:
          "Tour package is required.",
      });
    }

    if (!departure) {
      return res.status(400).json({
        message:
          "Departure is required.",
      });
    }

    if (
      travelers === undefined ||
      travelers === null
    ) {
      return res.status(400).json({
        message:
          "Number of travelers is required.",
      });
    }

    if (
      !Number.isInteger(travelers) ||
      travelers < 1
    ) {
      return res.status(400).json({
        message:
          "Number of travelers must be a positive integer.",
      });
    }

    // --------------------------------------------------
    // Validate IDs
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        tourPackage
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid tour package ID.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        departure
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid departure ID.",
      });
    }

    // --------------------------------------------------
    // Start Transaction
    // --------------------------------------------------

    session.startTransaction();

    // --------------------------------------------------
    // Find Tour Package
    // --------------------------------------------------

    const packageData =
      await TourPackage.findById(
        tourPackage
      ).session(session);

    if (!packageData) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Tour package not found.",
      });
    }

    // --------------------------------------------------
    // Package Must Be Active
    // --------------------------------------------------

    if (
      packageData.status !==
      "active"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This tour package is not currently available for booking.",
      });
    }

    // --------------------------------------------------
    // Validate Package Group Limit
    // --------------------------------------------------

    if (
      packageData.groupLimit &&
      packageData.groupLimit.hasLimit &&
      travelers >
        packageData.groupLimit.maxGroupSize
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Number of travelers exceeds the maximum group size for this package.",
        maxGroupSize:
          packageData.groupLimit.maxGroupSize,
        requestedTravelers:
          travelers,
      });
    }

    // --------------------------------------------------
    // Find Departure
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
    // Verify Departure Belongs To Package
    // --------------------------------------------------

    if (
      departureData.tourPackage.toString() !==
      packageData._id.toString()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Selected departure does not belong to the selected tour package.",
      });
    }

    // --------------------------------------------------
    // Validate Departure Status
    // --------------------------------------------------

    if (
      departureData.status !==
      "open"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Selected departure is not currently open for booking.",
      });
    }

    // --------------------------------------------------
    // Validate Departure Date
    // --------------------------------------------------

    if (
      departureData.departureDate <=
      new Date()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This departure date has already passed.",
      });
    }

    // --------------------------------------------------
    // Validate Capacity
    // --------------------------------------------------

    const remainingSeats =
      departureData.capacity -
      departureData.bookedSeats;

    if (
      travelers >
      remainingSeats
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Not enough seats are available for this departure.",
        remainingSeats,
        requestedSeats:
          travelers,
      });
    }

    // --------------------------------------------------
    // Calculate Booking Price
    // --------------------------------------------------

    const pricePerPerson =
      packageData.pricePerPerson;

    const totalPrice =
      pricePerPerson *
      travelers;

    // --------------------------------------------------
    // Create Pending Booking
    // --------------------------------------------------

    const booking =
      await Booking.create(
        [
          {
            user: userId,

            tourPackage:
              packageData._id,

            departure:
              departureData._id,

            travelers,

            pricePerPersonAtBooking:
              pricePerPerson,

            totalPrice,

            status: "pending",
          },
        ],
        {
          session,
        }
      );

    // --------------------------------------------------
    // Reserve Departure Seats
    // --------------------------------------------------
    //
    // Re-check the capacity condition inside the
    // transaction so concurrent booking attempts
    // cannot exceed the available capacity.
    // --------------------------------------------------

    const updatedDeparture =
      await Departure.findOneAndUpdate(
        {
          _id: departureData._id,

          status: "open",

          departureDate: {
            $gt: new Date(),
          },

          $expr: {
            $lte: [
              {
                $add: [
                  "$bookedSeats",
                  travelers,
                ],
              },
              "$capacity",
            ],
          },
        },
        {
          $inc: {
            bookedSeats:
              travelers,
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!updatedDeparture) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "The requested seats are no longer available. Please select another departure or reduce the number of travelers.",
      });
    }

    // --------------------------------------------------
    // Mark Departure Full When Necessary
    // --------------------------------------------------

    if (
      updatedDeparture.bookedSeats >=
      updatedDeparture.capacity
    ) {
      updatedDeparture.status =
        "full";

      await updatedDeparture.save({
        session,
      });
    }

    // --------------------------------------------------
    // Commit Transaction
    // --------------------------------------------------

    await session.commitTransaction();

    // --------------------------------------------------
    // Populate Booking
    // --------------------------------------------------

    const populatedBooking =
      await Booking.findById(
        booking[0]._id
      )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson groupLimit"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        );

    // --------------------------------------------------
    // Return Booking
    // --------------------------------------------------

    return res.status(201).json({
      message:
        "Booking created successfully.",

      booking:
        populatedBooking,
    });
  } catch (error) {
    // --------------------------------------------------
    // Rollback Transaction
    // --------------------------------------------------

    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Create booking error:",
      error
    );

    // --------------------------------------------------
    // Duplicate Booking Reference
    // --------------------------------------------------

    if (
      error?.code === 11000 &&
      error?.keyPattern
        ?.bookingReference
    ) {
      return res.status(409).json({
        message:
          "A booking reference conflict occurred. Please try again.",
      });
    }

    return res.status(500).json({
      message:
        "Something went wrong while creating the booking.",
    });
  } finally {
    await session.endSession();
  }
};

// --------------------------------------------------
// Get Current User's Bookings
// --------------------------------------------------

const getMyBookings = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const bookings =
      await Booking.find({
        user: userId,
      })
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson groupLimit"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error(
      "Get my bookings error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving your bookings.",
    });
  }
};

// --------------------------------------------------
// Get Single User Booking
// --------------------------------------------------

const getBookingById = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const { id } =
      req.params;

    // --------------------------------------------------
    // Validate Booking ID
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid booking ID.",
      });
    }

    // --------------------------------------------------
    // Find User's Booking
    // --------------------------------------------------

    const booking =
      await Booking.findOne({
        _id: id,
        user: userId,
      })
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson groupLimit"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        );

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found.",
      });
    }

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving the booking.",
    });
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
};
