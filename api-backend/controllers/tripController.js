const Trip = require("../models/Trip");

// 1. Save a new trip
exports.saveTrip = async (req, res) => {
  try {
    const { destinationId, notes, startDate, endDate, travelers } = req.body;

    // Check if trip already exists for this user+destination
    const existingTrip = await Trip.findOne({
      user: req.user,
      destination: destinationId,
    });

    if (existingTrip) {
      return res.status(400).json({ msg: "Trip already saved to your dashboard!" });
    }

    const newTrip = new Trip({
      user: req.user,
      destination: destinationId,
      notes: notes || "",
      startDate: startDate || null,
      endDate: endDate || null,
      travelers: travelers || 1,
    });

    const savedTrip = await newTrip.save();
    const populated = await savedTrip.populate("destination");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get all trips for the logged-in user
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user }).populate("destination").sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ msg: "Trip not found" });
    }

    // Make sure the trip belongs to the logged-in user
    if (trip.user.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized to delete this trip" });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ msg: "Trip removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update trip status
exports.updateTrip = async (req, res) => {
  try {
    const { status, notes, startDate, endDate, travelers } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ msg: "Trip not found" });
    }

    if (trip.user.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status, notes, startDate, endDate, travelers },
      { new: true }
    ).populate("destination");

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};