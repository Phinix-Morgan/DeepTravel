const mongoose = require("mongoose");

// --------------------------------------------------
// Booking Reference Generator
// --------------------------------------------------

function generateBookingReference() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let reference = "DT-";

  for (let i = 0; i < 8; i += 1) {
    const index = Math.floor(
      Math.random() * characters.length
    );

    reference += characters[index];
  }

  return reference;
}

// --------------------------------------------------
// Booking Schema
// --------------------------------------------------

const bookingSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Human-readable Booking Reference
    // --------------------------------------------------

    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
      immutable: true,
    },

    // --------------------------------------------------
    // User
    // --------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Tour Package
    // --------------------------------------------------

    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourPackage",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Departure
    // --------------------------------------------------

    departure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departure",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Travelers
    // --------------------------------------------------

    travelers: {
      type: Number,
      required: true,
      min: 1,
    },

    // --------------------------------------------------
    // Price Snapshot
    // --------------------------------------------------
    //
    // These values represent the price at the
    // moment the booking was created.
    //
    // This prevents later package price changes
    // from modifying an existing booking.
    // --------------------------------------------------

    pricePerPersonAtBooking: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // --------------------------------------------------
    // Booking Status
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// Generate Booking Reference Automatically
// --------------------------------------------------

bookingSchema.pre("validate", async function () {
  if (
    this.bookingReference ||
    !this.isNew
  ) {
    return;
  }

  let reference;
  let exists = true;

  while (exists) {
    reference =
      generateBookingReference();

    exists =
      await mongoose.models.Booking.exists({
        bookingReference: reference,
      });
  }

  this.bookingReference = reference;
});

// --------------------------------------------------
// Indexes
// --------------------------------------------------

bookingSchema.index({
  user: 1,
  createdAt: -1,
});

bookingSchema.index({
  departure: 1,
  status: 1,
});

// --------------------------------------------------
// Model
// --------------------------------------------------

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);
