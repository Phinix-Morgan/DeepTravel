const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    category: {
      type: String,
      enum: ["City", "Beach", "Mountain", "Nature", "Historical", "Desert", "Island"],
      default: "City",
    },
    highlights: [{ type: String }],
    bestTime: { type: String, default: "" },
    weather: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", DestinationSchema);