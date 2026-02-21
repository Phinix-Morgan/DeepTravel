const Trip = require("../models/Trip");

// 1. Save a new trip
exports.saveTrip = async (req, res) => {
  try {
    const { destinationId, notes } = req.body;

    const newTrip = new Trip({
      user: req.user, // We get this from the authMiddleware (The VIP pass!)
      destination: destinationId,
      notes: notes || ""
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get all trips for the logged-in user
exports.getMyTrips = async (req, res) => {
  try {
    // Find trips that belong to this specific user ID
    // .populate("destination") tells MongoDB to go fetch the actual destination 
    // details (name, image, price) instead of just giving us the ID!
    const trips = await Trip.find({ user: req.user }).populate("destination");
    
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};