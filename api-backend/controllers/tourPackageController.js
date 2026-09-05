const mongoose = require("mongoose");
const TourPackage = require("../models/TourPackage");

/*
 * GET /api/packages
 *
 * Optional query parameters:
 *
 *   ?destination=<destinationId>
 *   ?status=active
 *
 * Examples:
 *
 *   GET /api/packages
 *   GET /api/packages?status=active
 *   GET /api/packages?destination=<destinationId>
 */
const getTourPackages = async (req, res) => {
  try {
    const { destination, status } = req.query;

    const filter = {};

    if (destination) {
      if (!mongoose.Types.ObjectId.isValid(destination)) {
        return res.status(400).json({
          message: "Invalid destination ID.",
        });
      }

      filter.destination = destination;
    }

    if (status) {
      if (!["draft", "active", "inactive"].includes(status)) {
        return res.status(400).json({
          message: "Invalid package status.",
        });
      }

      filter.status = status;
    }

    const packages = await TourPackage.find(filter)
      .populate(
        "destination",
        "name country description imageUrl highlights"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(packages);
  } catch (error) {
    console.error(
      "Get tour packages error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch tour packages.",
    });
  }
};


/*
 * GET /api/packages/:id
 *
 * Returns one tour package by ID.
 */
const getTourPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid tour package ID.",
      });
    }

    const tourPackage = await TourPackage.findById(id)
      .populate(
        "destination",
        "name country description imageUrl highlights"
      )
      .lean();

    if (!tourPackage) {
      return res.status(404).json({
        message: "Tour package not found.",
      });
    }

    return res.status(200).json(tourPackage);
  } catch (error) {
    console.error(
      "Get tour package error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch tour package.",
    });
  }
};


/*
 * GET /api/packages/destination/:destinationId
 *
 * Returns active packages belonging
 * to a specific destination.
 */
const getPackagesByDestination = async (
  req,
  res
) => {
  try {
    const { destinationId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        destinationId
      )
    ) {
      return res.status(400).json({
        message: "Invalid destination ID.",
      });
    }

    const packages = await TourPackage.find({
      destination: destinationId,
      status: "active",
    })
      .populate(
        "destination",
        "name country description imageUrl highlights"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(packages);
  } catch (error) {
    console.error(
      "Get destination packages error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch destination packages.",
    });
  }
};


module.exports = {
  getTourPackages,
  getTourPackageById,
  getPackagesByDestination,
};
