const Destination = require("../models/Destination");

// Get all destinations to display on the Explore page
exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// A temporary helper to fill your empty database with sample data
exports.seedDestinations = async (req, res) => {
  try {
    const count = await Destination.countDocuments();
    if (count > 0)
      return res.json({ msg: "Database already has destinations!" });

    const dummyData = [
      {
        name: "Neon Streets of Shibuya",
        country: "Japan",
        description:
          "Experience the vibrant nightlife and ancient traditions colliding in modern Tokyo.",
        imageUrl:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        pricePerNight: 120,
      },
      {
        name: "Oia Cliffs",
        country: "Greece",
        description:
          "Watch the world's most beautiful sunset from the iconic blue-domed churches.",
        imageUrl:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
        pricePerNight: 200,
      },
      {
        name: "Zermatt Peaks",
        country: "Switzerland",
        description:
          "Breathtaking views of the Matterhorn and world-class alpine skiing.",
        imageUrl:
          "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
        pricePerNight: 250,
      },
    ];

    await Destination.insertMany(dummyData);
    res
      .status(201)
      .json({ msg: "✅ 3 Dummy destinations seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Only: Create a new destination for the Explore page
exports.createDestination = async (req, res) => {
  try {
    const { name, country, description, imageUrl, pricePerNight } = req.body;

    const newDestination = new Destination({
      name,
      country,
      description,
      imageUrl,
      pricePerNight,
    });

    const savedDestination = await newDestination.save();
    res.status(201).json(savedDestination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
