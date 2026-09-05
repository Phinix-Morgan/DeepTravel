const express = require("express");

const {
  getTourPackages,
  getTourPackageById,
  getPackagesByDestination,
} = require("../controllers/tourPackageController");

const router = express.Router();

/*
 * GET /api/packages
 *
 * Optional:
 *   ?destination=<destinationId>
 *   ?status=active
 */
router.get("/", getTourPackages);

/*
 * GET /api/packages/destination/:destinationId
 *
 * Returns active packages for one destination.
 */
router.get(
  "/destination/:destinationId",
  getPackagesByDestination
);

/*
 * GET /api/packages/:id
 *
 * Returns one package with its destination populated.
 */
router.get("/:id", getTourPackageById);

module.exports = router;
