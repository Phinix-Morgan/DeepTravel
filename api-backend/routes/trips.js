const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, tripController.saveTrip);
router.get("/", authMiddleware, tripController.getMyTrips);
router.delete("/:id", authMiddleware, tripController.deleteTrip);
router.put("/:id", authMiddleware, tripController.updateTrip);

module.exports = router;