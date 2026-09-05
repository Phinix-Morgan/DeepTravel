const Destination = require("../models/Destination");

// --------------------------------------------------
// Get all destinations
// GET /api/destinations
// --------------------------------------------------

const getDestinations = async (req, res) => {
  try {
    const { search, country, sort } = req.query;

    const filter = {};

    if (country) {
      filter.country = {
        $regex: country,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          country: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let query = Destination.find(filter);

    if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else if (sort === "oldest") {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ name: 1 });
    }

    const destinations = await query.lean();

    res.status(200).json(destinations);
  } catch (error) {
    console.error(
      "Get destinations error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch destinations.",
    });
  }
};

// --------------------------------------------------
// Get destination by ID
// GET /api/destinations/:id
// --------------------------------------------------

const getDestinationById = async (req, res) => {
  try {
    const destination =
      await Destination.findById(req.params.id).lean();

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found.",
      });
    }

    res.status(200).json(destination);
  } catch (error) {
    console.error(
      "Get destination error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch destination.",
    });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
};