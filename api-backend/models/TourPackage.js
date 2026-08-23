const mongoose = require("mongoose");

const itineraryDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    places: {
      type: [String],
      default: [],
    },

    activities: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const tourPackageSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      days: {
        type: Number,
        required: true,
        min: 1,
      },

      nights: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    pricePerPerson: {
      type: Number,
      required: true,
      min: 0,
    },

    groupLimit: {
      hasLimit: {
        type: Boolean,
        default: true,
      },

      maxGroupSize: {
        type: Number,
        min: 1,
        default: null,
      },
    },

    accommodation: {
      included: {
        type: Boolean,
        default: true,
      },

      name: {
        type: String,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },
    },

    meals: {
      breakfast: {
        type: Boolean,
        default: false,
      },

      lunch: {
        type: Boolean,
        default: false,
      },

      dinner: {
        type: Boolean,
        default: false,
      },
    },

    transportation: {
      included: {
        type: Boolean,
        default: true,
      },

      description: {
        type: String,
        trim: true,
      },
    },

    activities: {
      included: {
        type: Boolean,
        default: true,
      },

      description: {
        type: String,
        trim: true,
      },
    },

    itinerary: {
      type: [itineraryDaySchema],
      default: [],
    },

    inclusions: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TourPackage",
  tourPackageSchema
);
