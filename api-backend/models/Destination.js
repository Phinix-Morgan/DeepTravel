const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
});

module.exports = mongoose.model("Destination", DestinationSchema);
