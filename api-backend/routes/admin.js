const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminCustomTripRoutes = require("./adminCustomTrips");
const admin = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", admin.getDashboard);

router.route("/destinations").get(admin.listDestinations).post(admin.createDestination);
router.route("/destinations/:id").get(admin.getDestination).patch(admin.updateDestination).delete(admin.deleteDestination);

router.route("/packages").get(admin.listPackages).post(admin.createPackage);
router.route("/packages/:id").get(admin.getPackage).patch(admin.updatePackage).delete(admin.deletePackage);

router.route("/departures").get(admin.listDepartures).post(admin.createDeparture);
router.route("/departures/:id").get(admin.getDeparture).patch(admin.updateDeparture).delete(admin.deleteDeparture);

router.get("/bookings", admin.listBookings);
router.get("/bookings/:id", admin.getBooking);
router.patch("/bookings/:id/status", admin.updateBookingStatus);

router.get("/payments", admin.listPayments);
router.get("/payments/:id", admin.getPayment);

router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);
router.patch("/users/:id/role", admin.updateUserRole);

// Retain the established endpoint and its dedicated router unchanged.
router.use("/custom-trips", adminCustomTripRoutes);

module.exports = router;
