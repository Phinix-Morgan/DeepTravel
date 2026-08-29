const mongoose = require("mongoose");

const departureSchema = new mongoose.Schema(
  {
    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourPackage",
      required: true,
      index: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "open",
        "full",
        "cancelled",
        "completed",
      ],
      default: "open",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// Virtual: Remaining Seats
// --------------------------------------------------

departureSchema.virtual("remainingSeats").get(function () {
  return Math.max(
    this.capacity - this.bookedSeats,
    0
  );
});

// --------------------------------------------------
// Validate booked seats
// --------------------------------------------------

departureSchema.pre("validate", function () {
  if (this.bookedSeats > this.capacity) {
    this.invalidate(
      "bookedSeats",
      "Booked seats cannot exceed departure capacity."
    );
  }

  if (
    this.bookedSeats === this.capacity &&
    this.status !== "cancelled" &&
    this.status !== "completed"
  ) {
    this.status = "full";
  }
});

// --------------------------------------------------
// Virtuals in JSON/Object
// --------------------------------------------------

departureSchema.set("toJSON", {
  virtuals: true,
});

departureSchema.set("toObject", {
  virtuals: true,
});

// --------------------------------------------------
// Index
// --------------------------------------------------

departureSchema.index({
  tourPackage: 1,
  departureDate: 1,
});

module.exports = mongoose.model(
  "Departure",
  departureSchema
);
