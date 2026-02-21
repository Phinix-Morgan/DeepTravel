const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  // Reference the User who created the trip
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Reference the Destination they want to visit
  destination: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Destination", 
    required: true 
  },
  status: {
    type: String,
    enum: ["Planned", "Completed"],
    default: "Planned"
  },
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Trip", TripSchema);