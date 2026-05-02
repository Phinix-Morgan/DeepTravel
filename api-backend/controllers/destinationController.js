const Destination = require("../models/Destination");

// Get all destinations
exports.getAllDestinations = async (req, res) => {
  try {
    const { search, country, minPrice, maxPrice, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (country) query.country = { $regex: country, $options: "i" };
    if (minPrice) query.pricePerNight = { ...query.pricePerNight, $gte: Number(minPrice) };
    if (maxPrice) query.pricePerNight = { ...query.pricePerNight, $lte: Number(maxPrice) };

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { pricePerNight: 1 };
    if (sort === "price_desc") sortOption = { pricePerNight: -1 };
    if (sort === "name") sortOption = { name: 1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const destinations = await Destination.find(query).sort(sortOption);
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single destination by ID
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ msg: "Destination not found" });
    }
    res.json(destination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Seed destinations
exports.seedDestinations = async (req, res) => {
  try {
    const count = await Destination.countDocuments();
    if (count > 0) return res.json({ msg: "Database already has destinations!" });

    const dummyData = [
      {
        name: "Neon Streets of Shibuya",
        country: "Japan",
        description:
          "Experience the vibrant nightlife and ancient traditions colliding in modern Tokyo. From the iconic Shibuya crossing to serene temples, Tokyo offers an unparalleled blend of the ultramodern and the traditional.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        pricePerNight: 120,
        rating: 4.8,
        category: "City",
        highlights: ["Shibuya Crossing", "Senso-ji Temple", "Harajuku", "Mt. Fuji Day Trip"],
        bestTime: "March-May, September-November",
        weather: "Temperate",
      },
      {
        name: "Oia Cliffs",
        country: "Greece",
        description:
          "Watch the world's most beautiful sunset from the iconic blue-domed churches perched on volcanic cliffs. Santorini's Oia village is a masterpiece of Cycladic architecture with breathtaking Aegean Sea views.",
        imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
        pricePerNight: 200,
        rating: 4.9,
        category: "Beach",
        highlights: ["Sunset Views", "Blue Domed Churches", "Caldera", "Wine Tasting"],
        bestTime: "June-August",
        weather: "Mediterranean",
      },
      {
        name: "Zermatt Peaks",
        country: "Switzerland",
        description:
          "Breathtaking views of the Matterhorn and world-class alpine skiing in a car-free village. Zermatt offers year-round mountain adventures with luxury chalets and gourmet restaurants.",
        imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
        pricePerNight: 250,
        rating: 4.7,
        category: "Mountain",
        highlights: ["Matterhorn Views", "Skiing", "Hiking Trails", "Glacier Paradise"],
        bestTime: "December-March, July-August",
        weather: "Alpine",
      },
      {
        name: "Bali Rice Terraces",
        country: "Indonesia",
        description:
          "Discover the mystical beauty of ancient rice terraces carved into emerald hillsides. Bali's spiritual heart beats in its lush landscapes, sacred temples, and vibrant arts scene.",
        imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        pricePerNight: 85,
        rating: 4.6,
        category: "Nature",
        highlights: ["Tegallalang Rice Terraces", "Tanah Lot Temple", "Ubud Monkey Forest", "Surf Lessons"],
        bestTime: "April-October",
        weather: "Tropical",
      },
      {
        name: "Machu Picchu Citadel",
        country: "Peru",
        description:
          "Trek through the clouds to the legendary Lost City of the Incas. This 15th-century citadel set high in the Andes Mountains is one of humanity's greatest architectural achievements.",
        imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
        pricePerNight: 95,
        rating: 4.9,
        category: "Historical",
        highlights: ["Sun Gate", "Inca Trail", "Huayna Picchu", "Sacred Valley"],
        bestTime: "May-September",
        weather: "Mountain",
      },
      {
        name: "Amalfi Coastline",
        country: "Italy",
        description:
          "Wind along dramatic cliff-hugging roads overlooking turquoise Mediterranean waters. The Amalfi Coast dazzles with pastel-colored villages, fragrant lemon groves, and exceptional cuisine.",
        imageUrl: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80",
        pricePerNight: 180,
        rating: 4.8,
        category: "Beach",
        highlights: ["Positano Village", "Ravello Gardens", "Boat Tours", "Local Limoncello"],
        bestTime: "May-October",
        weather: "Mediterranean",
      },
    ];

    await Destination.insertMany(dummyData);
    res.status(201).json({ msg: "6 destinations seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Create destination
exports.createDestination = async (req, res) => {
  try {
    const { name, country, description, imageUrl, pricePerNight, category, rating, highlights, bestTime, weather } =
      req.body;

    const newDestination = new Destination({
      name,
      country,
      description,
      imageUrl,
      pricePerNight,
      category: category || "City",
      rating: rating || 4.5,
      highlights: highlights || [],
      bestTime: bestTime || "",
      weather: weather || "",
    });

    const savedDestination = await newDestination.save();
    res.status(201).json(savedDestination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Delete destination
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ msg: "Destination not found" });
    }
    res.json({ msg: "Destination deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};