const mongoose = require("mongoose");

const customTripRequestSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Customer
    // --------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Base Tour Package
    // --------------------------------------------------

    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourPackage",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Trip Requirements
    // --------------------------------------------------

    preferredStartDate: {
      type: Date,
      required: true,
    },

    travelers: {
      type: Number,
      required: true,
      min: 1,
    },

    requestedDuration: {
      days: {
        type: Number,
        min: 1,
      },

      nights: {
        type: Number,
        min: 0,
      },
    },

    // --------------------------------------------------
    // Customization Requests
    // --------------------------------------------------

    itineraryChanges: {
      type: String,
      trim: true,
      default: "",
    },

    accommodationPreferences: {
      type: String,
      trim: true,
      default: "",
    },

    transportationPreferences: {
      type: String,
      trim: true,
      default: "",
    },

    additionalActivities: {
      type: String,
      trim: true,
      default: "",
    },

    customerMessage: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------------------------------------
    // Admin Quotation
    // --------------------------------------------------

    quotedPricePerPerson: {
      type: Number,
      min: 0,
      default: null,
    },

    quotedTotalPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------------------------------------
    // Request Status
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "quoted",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // --------------------------------------------------
    // Quote Expiration
    // --------------------------------------------------

    quoteExpiresAt: {
      type: Date,
      default: null,
    },

    // --------------------------------------------------
    // Conversion to Booking
    // --------------------------------------------------

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// Indexes
// --------------------------------------------------

customTripRequestSchema.index({
  user: 1,
  createdAt: -1,
});

customTripRequestSchema.index({
  tourPackage: 1,
  status: 1,
});

module.exports = mongoose.model(
  "CustomTripRequest",
  customTripRequestSchema
);
