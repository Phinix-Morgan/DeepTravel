const mongoose = require("mongoose");

const User = require("../models/User");
const Destination = require("../models/Destination");
const TourPackage = require("../models/TourPackage");
const Departure = require("../models/Departure");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const CustomTripRequest = require("../models/CustomTripRequest");
const { cancelBookingById } = require("../services/bookingCancellationService");

const PACKAGE_STATUSES = ["draft", "active", "inactive"];
const DEPARTURE_STATUSES = ["scheduled", "open", "full", "cancelled", "completed"];
const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const USER_ROLES = ["user", "admin"];
const SAFE_USER_FIELDS = "name email authProvider emailVerified role createdAt updatedAt";
const ALLOWED_PACKAGE_FIELDS = [
  "destination", "title", "description", "imageUrl", "duration", "pricePerPerson",
  "groupLimit", "accommodation", "meals", "transportation", "activities", "itinerary",
  "inclusions", "exclusions", "status",
];

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function pageResponse(items, total, page, limit, key) {
  return {
    [key]: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function assignAllowed(document, body, fields) {
  fields.forEach((field) => {
    if (hasOwn(body, field)) document[field] = body[field];
  });
}

function handleError(res, error, fallback) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: "A record with this value already exists." });
  }
  console.error(fallback, error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : fallback,
  });
}

function requireValidId(res, id, label) {
  if (!isValidId(id)) {
    res.status(400).json({ message: `Invalid ${label} ID.` });
    return false;
  }
  return true;
}

function populatedBookingQuery(query) {
  return query
    .populate("user", SAFE_USER_FIELDS)
    .populate("tourPackage", "title imageUrl duration pricePerPerson status")
    .populate("departure", "departureDate capacity bookedSeats status notes");
}

async function getDashboard(req, res) {
  try {
    const now = new Date();
    const [
      totalUsers, totalDestinations, totalTourPackages, activeTourPackages,
      totalDepartures, upcomingDepartures, bookingStatuses, paymentStatuses,
      paidRevenue, customTripStatuses, recentBookings, recentCustomTrips, recentPayments,
    ] = await Promise.all([
      User.countDocuments(), Destination.countDocuments(), TourPackage.countDocuments(),
      TourPackage.countDocuments({ status: "active" }), Departure.countDocuments(),
      Departure.countDocuments({ departureDate: { $gt: now }, status: { $in: ["scheduled", "open", "full"] } }),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      CustomTripRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      populatedBookingQuery(Booking.find().sort({ createdAt: -1 }).limit(5)).lean(),
      CustomTripRequest.find().sort({ createdAt: -1 }).limit(5)
        .populate("user", SAFE_USER_FIELDS).populate("tourPackage", "title imageUrl").lean(),
      Payment.find().sort({ createdAt: -1 }).limit(5).select("-providerSignature")
        .populate("user", SAFE_USER_FIELDS).populate("booking", "bookingReference totalPrice status").lean(),
    ]);

    const countByStatus = (rows, status) => rows.find((row) => row._id === status)?.count || 0;
    return res.status(200).json({
      metrics: {
        totalUsers, totalDestinations, totalTourPackages, activeTourPackages, totalDepartures,
        upcomingDepartures, totalBookings: bookingStatuses.reduce((sum, row) => sum + row.count, 0),
        pendingBookings: countByStatus(bookingStatuses, "pending"), confirmedBookings: countByStatus(bookingStatuses, "confirmed"),
        cancelledBookings: countByStatus(bookingStatuses, "cancelled"), completedBookings: countByStatus(bookingStatuses, "completed"),
        totalPayments: paymentStatuses.reduce((sum, row) => sum + row.count, 0), paidPayments: countByStatus(paymentStatuses, "paid"),
        totalRevenue: paidRevenue[0]?.total || 0,
        pendingCustomTripRequests: countByStatus(customTripStatuses, "pending"),
        quotedCustomTripRequests: countByStatus(customTripStatuses, "quoted"),
        acceptedCustomTripRequests: countByStatus(customTripStatuses, "accepted"),
      },
      recentActivity: { recentBookings, recentCustomTripRequests: recentCustomTrips, recentPayments },
    });
  } catch (error) { return handleError(res, error, "Unable to load admin dashboard."); }
}

async function listDestinations(req, res) {
  try {
    const filter = {};
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search), "i");
      filter.$or = [{ name: search }, { country: search }, { description: search }];
    }
    const { page, limit, skip } = pagination(req.query);
    const [destinations, total] = await Promise.all([Destination.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(), Destination.countDocuments(filter)]);
    return res.status(200).json(pageResponse(destinations, total, page, limit, "destinations"));
  } catch (error) { return handleError(res, error, "Unable to retrieve destinations."); }
}

async function getDestination(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "destination")) return;
    const destination = await Destination.findById(req.params.id).lean();
    return destination ? res.status(200).json({ destination }) : res.status(404).json({ message: "Destination not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve destination."); }
}

async function createDestination(req, res) {
  try {
    const destination = await Destination.create({ name: req.body.name, country: req.body.country, description: req.body.description, imageUrl: req.body.imageUrl, highlights: req.body.highlights });
    return res.status(201).json({ message: "Destination created successfully.", destination });
  } catch (error) { return handleError(res, error, "Unable to create destination."); }
}

async function updateDestination(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "destination")) return;
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    assignAllowed(destination, req.body, ["name", "country", "description", "imageUrl", "highlights"]);
    await destination.save();
    return res.status(200).json({ message: "Destination updated successfully.", destination });
  } catch (error) { return handleError(res, error, "Unable to update destination."); }
}

async function deleteDestination(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "destination")) return;
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    if (await TourPackage.exists({ destination: destination._id })) return res.status(409).json({ message: "This destination cannot be deleted because tour packages still reference it." });
    await destination.deleteOne();
    return res.status(200).json({ message: "Destination deleted successfully." });
  } catch (error) { return handleError(res, error, "Unable to delete destination."); }
}

async function ensureDestination(destinationId, res) {
  if (!isValidId(destinationId)) { res.status(400).json({ message: "Invalid destination ID." }); return false; }
  if (!await Destination.exists({ _id: destinationId })) { res.status(404).json({ message: "Destination not found." }); return false; }
  return true;
}

async function listPackages(req, res) {
  try {
    const filter = {};
    if (req.query.status) {
      if (!PACKAGE_STATUSES.includes(req.query.status)) return res.status(400).json({ message: "Invalid package status." });
      filter.status = req.query.status;
    }
    if (req.query.destination) {
      if (!requireValidId(res, req.query.destination, "destination")) return;
      filter.destination = req.query.destination;
    }
    if (req.query.search) { const search = new RegExp(escapeRegex(req.query.search), "i"); filter.$or = [{ title: search }, { description: search }]; }
    const { page, limit, skip } = pagination(req.query);
    const [packages, total] = await Promise.all([TourPackage.find(filter).populate("destination", "name country imageUrl").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), TourPackage.countDocuments(filter)]);
    return res.status(200).json(pageResponse(packages, total, page, limit, "packages"));
  } catch (error) { return handleError(res, error, "Unable to retrieve tour packages."); }
}

async function getPackage(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "tour package")) return;
    const tourPackage = await TourPackage.findById(req.params.id).populate("destination", "name country description imageUrl highlights").lean();
    return tourPackage ? res.status(200).json({ package: tourPackage }) : res.status(404).json({ message: "Tour package not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve tour package."); }
}

async function createPackage(req, res) {
  try {
    if (!await ensureDestination(req.body.destination, res)) return;
    if (hasOwn(req.body, "status") && !PACKAGE_STATUSES.includes(req.body.status)) return res.status(400).json({ message: "Invalid package status." });
    const values = {}; assignAllowed(values, req.body, ALLOWED_PACKAGE_FIELDS);
    const tourPackage = await TourPackage.create(values);
    return res.status(201).json({ message: "Tour package created successfully.", package: tourPackage });
  } catch (error) { return handleError(res, error, "Unable to create tour package."); }
}

async function updatePackage(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "tour package")) return;
    if (hasOwn(req.body, "destination") && !await ensureDestination(req.body.destination, res)) return;
    if (hasOwn(req.body, "status") && !PACKAGE_STATUSES.includes(req.body.status)) return res.status(400).json({ message: "Invalid package status." });
    const tourPackage = await TourPackage.findById(req.params.id);
    if (!tourPackage) return res.status(404).json({ message: "Tour package not found." });
    assignAllowed(tourPackage, req.body, ALLOWED_PACKAGE_FIELDS);
    await tourPackage.save();
    return res.status(200).json({ message: "Tour package updated successfully.", package: tourPackage });
  } catch (error) { return handleError(res, error, "Unable to update tour package."); }
}

async function deletePackage(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "tour package")) return;
    const tourPackage = await TourPackage.findById(req.params.id);
    if (!tourPackage) return res.status(404).json({ message: "Tour package not found." });
    const [departure, booking, customTrip] = await Promise.all([Departure.exists({ tourPackage: tourPackage._id }), Booking.exists({ tourPackage: tourPackage._id }), CustomTripRequest.exists({ tourPackage: tourPackage._id })]);
    if (departure || booking || customTrip) return res.status(409).json({ message: "This tour package cannot be deleted because departures, bookings, or custom trip requests reference it. Set its status to inactive instead." });
    await tourPackage.deleteOne();
    return res.status(200).json({ message: "Tour package deleted successfully." });
  } catch (error) { return handleError(res, error, "Unable to delete tour package."); }
}

async function listDepartures(req, res) {
  try {
    const filter = {};
    if (req.query.status) { if (!DEPARTURE_STATUSES.includes(req.query.status)) return res.status(400).json({ message: "Invalid departure status." }); filter.status = req.query.status; }
    if (req.query.tourPackage) { if (!requireValidId(res, req.query.tourPackage, "tour package")) return; filter.tourPackage = req.query.tourPackage; }
    if (req.query.from || req.query.to) { filter.departureDate = {}; if (req.query.from) filter.departureDate.$gte = new Date(req.query.from); if (req.query.to) filter.departureDate.$lte = new Date(req.query.to); }
    const { page, limit, skip } = pagination(req.query);
    const [departures, total] = await Promise.all([Departure.find(filter).populate("tourPackage", "title status duration").sort({ departureDate: 1 }).skip(skip).limit(limit).lean({ virtuals: true }), Departure.countDocuments(filter)]);
    return res.status(200).json(pageResponse(departures, total, page, limit, "departures"));
  } catch (error) { return handleError(res, error, "Unable to retrieve departures."); }
}

async function getDeparture(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "departure")) return;
    const departure = await Departure.findById(req.params.id).populate("tourPackage", "title status duration").lean({ virtuals: true });
    return departure ? res.status(200).json({ departure }) : res.status(404).json({ message: "Departure not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve departure."); }
}

function validDepartureInput(body, res, { creating = false, bookedSeats = 0 } = {}) {
  if (creating && (!Number.isInteger(body.capacity) || body.capacity < 1)) { res.status(400).json({ message: "Capacity must be a positive integer." }); return false; }
  if (hasOwn(body, "capacity") && (!Number.isInteger(body.capacity) || body.capacity < bookedSeats)) { res.status(400).json({ message: "Capacity must be a positive integer and cannot be below booked seats." }); return false; }
  if (hasOwn(body, "bookedSeats")) { res.status(400).json({ message: "Booked seats are managed by booking operations and cannot be updated here." }); return false; }
  if (hasOwn(body, "status") && !DEPARTURE_STATUSES.includes(body.status)) { res.status(400).json({ message: "Invalid departure status." }); return false; }
  if (creating && (!body.departureDate || Number.isNaN(new Date(body.departureDate).getTime()))) { res.status(400).json({ message: "A valid departure date is required." }); return false; }
  if (hasOwn(body, "departureDate") && Number.isNaN(new Date(body.departureDate).getTime())) { res.status(400).json({ message: "Please provide a valid departure date." }); return false; }
  return true;
}

async function createDeparture(req, res) {
  try {
    if (!await ensurePackage(req.body.tourPackage, res)) return;
    if (!validDepartureInput(req.body, res, { creating: true })) return;
    const departure = await Departure.create({ tourPackage: req.body.tourPackage, departureDate: req.body.departureDate, capacity: req.body.capacity, status: req.body.status, notes: req.body.notes });
    return res.status(201).json({ message: "Departure created successfully.", departure });
  } catch (error) { return handleError(res, error, "Unable to create departure."); }
}

async function ensurePackage(packageId, res) {
  if (!isValidId(packageId)) { res.status(400).json({ message: "Invalid tour package ID." }); return false; }
  if (!await TourPackage.exists({ _id: packageId })) { res.status(404).json({ message: "Tour package not found." }); return false; }
  return true;
}

async function updateDeparture(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "departure")) return;
    const departure = await Departure.findById(req.params.id);
    if (!departure) return res.status(404).json({ message: "Departure not found." });
    if (!validDepartureInput(req.body, res, { bookedSeats: departure.bookedSeats })) return;
    if (hasOwn(req.body, "tourPackage")) {
      if (!await ensurePackage(req.body.tourPackage, res)) return;
      if (String(req.body.tourPackage) !== String(departure.tourPackage) && await Booking.exists({ departure: departure._id })) return res.status(409).json({ message: "A departure with bookings cannot be moved to another tour package." });
    }
    if (req.body.status === "cancelled" && await Booking.exists({ departure: departure._id, status: { $in: ["pending", "confirmed"] } })) {
      return res.status(409).json({ message: "Cancel active bookings before cancelling this departure." });
    }
    assignAllowed(departure, req.body, ["tourPackage", "departureDate", "capacity", "status", "notes"]);
    await departure.save();
    return res.status(200).json({ message: "Departure updated successfully.", departure });
  } catch (error) { return handleError(res, error, "Unable to update departure."); }
}

async function deleteDeparture(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "departure")) return;
    const departure = await Departure.findById(req.params.id);
    if (!departure) return res.status(404).json({ message: "Departure not found." });
    if (await Booking.exists({ departure: departure._id })) return res.status(409).json({ message: "This departure cannot be deleted because bookings reference it." });
    await departure.deleteOne();
    return res.status(200).json({ message: "Departure deleted successfully." });
  } catch (error) { return handleError(res, error, "Unable to delete departure."); }
}

async function listBookings(req, res) {
  try {
    const filter = {};
    if (req.query.status) { if (!BOOKING_STATUSES.includes(req.query.status)) return res.status(400).json({ message: "Invalid booking status." }); filter.status = req.query.status; }
    for (const [key, label] of [["user", "user"], ["tourPackage", "tour package"]]) { if (req.query[key]) { if (!requireValidId(res, req.query[key], label)) return; filter[key] = req.query[key]; } }
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search), "i");
      const users = await User.find({ $or: [{ name: search }, { email: search }] }).select("_id").lean();
      filter.$or = [{ bookingReference: search }, { user: { $in: users.map((user) => user._id) } }];
    }
    const { page, limit, skip } = pagination(req.query);
    const [bookings, total] = await Promise.all([populatedBookingQuery(Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)).lean(), Booking.countDocuments(filter)]);
    return res.status(200).json(pageResponse(bookings, total, page, limit, "bookings"));
  } catch (error) { return handleError(res, error, "Unable to retrieve bookings."); }
}

async function getBooking(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "booking")) return;
    const booking = await populatedBookingQuery(Booking.findById(req.params.id)).lean();
    return booking ? res.status(200).json({ booking }) : res.status(404).json({ message: "Booking not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve booking."); }
}

async function updateBookingStatus(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "booking")) return;
    const { status } = req.body;
    if (!BOOKING_STATUSES.includes(status)) return res.status(400).json({ message: "Invalid booking status." });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.status === status) return res.status(400).json({ message: "Booking already has this status." });
    if (status === "cancelled") {
      if (!["pending", "confirmed"].includes(booking.status)) return res.status(400).json({ message: "Only pending or confirmed bookings can be cancelled." });
      const updatedBooking = await cancelBookingById(booking._id);
      return res.status(200).json({ message: "Booking cancelled successfully.", booking: updatedBooking });
    }
    if (booking.status === "confirmed" && status === "completed") {
      booking.status = "completed";
      await booking.save();
      const updatedBooking = await populatedBookingQuery(Booking.findById(booking._id));
      return res.status(200).json({ message: "Booking marked as completed.", booking: updatedBooking });
    }
    return res.status(400).json({ message: "This booking status transition is not allowed. Payment verification is required to confirm a booking." });
  } catch (error) { return handleError(res, error, "Unable to update booking status."); }
}

async function listPayments(req, res) {
  try {
    const filter = {};
    if (req.query.status) { if (!PAYMENT_STATUSES.includes(req.query.status)) return res.status(400).json({ message: "Invalid payment status." }); filter.status = req.query.status; }
    for (const key of ["booking", "user"]) { if (req.query[key]) { if (!requireValidId(res, req.query[key], key)) return; filter[key] = req.query[key]; } }
    if (req.query.from || req.query.to) { filter.createdAt = {}; if (req.query.from) filter.createdAt.$gte = new Date(req.query.from); if (req.query.to) filter.createdAt.$lte = new Date(req.query.to); }
    const { page, limit, skip } = pagination(req.query);
    const [payments, total] = await Promise.all([Payment.find(filter).select("-providerSignature").populate("user", SAFE_USER_FIELDS).populate("booking", "bookingReference travelers totalPrice status tourPackage departure").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Payment.countDocuments(filter)]);
    return res.status(200).json(pageResponse(payments, total, page, limit, "payments"));
  } catch (error) { return handleError(res, error, "Unable to retrieve payments."); }
}

async function getPayment(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "payment")) return;
    const payment = await Payment.findById(req.params.id).select("-providerSignature").populate("user", SAFE_USER_FIELDS).populate("booking", "bookingReference travelers totalPrice status tourPackage departure").lean();
    return payment ? res.status(200).json({ payment }) : res.status(404).json({ message: "Payment not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve payment."); }
}

async function listUsers(req, res) {
  try {
    const filter = {};
    if (req.query.role) { if (!USER_ROLES.includes(req.query.role)) return res.status(400).json({ message: "Invalid user role." }); filter.role = req.query.role; }
    if (req.query.search) { const search = new RegExp(escapeRegex(req.query.search), "i"); filter.$or = [{ name: search }, { email: search }]; }
    const { page, limit, skip } = pagination(req.query);
    const [users, total] = await Promise.all([User.find(filter).select(SAFE_USER_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), User.countDocuments(filter)]);
    return res.status(200).json(pageResponse(users, total, page, limit, "users"));
  } catch (error) { return handleError(res, error, "Unable to retrieve users."); }
}

async function getUser(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "user")) return;
    const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS).lean();
    return user ? res.status(200).json({ user }) : res.status(404).json({ message: "User not found." });
  } catch (error) { return handleError(res, error, "Unable to retrieve user."); }
}

async function updateUserRole(req, res) {
  try {
    if (!requireValidId(res, req.params.id, "user")) return;
    const { role } = req.body;
    if (!USER_ROLES.includes(role)) return res.status(400).json({ message: "Role must be either user or admin." });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === role) return res.status(400).json({ message: "User already has this role." });
    if (user.role === "admin" && role !== "admin") {
      if (String(user._id) === String(req.user.userId)) return res.status(400).json({ message: "You cannot remove your own admin role." });
      if (await User.countDocuments({ role: "admin" }) <= 1) return res.status(400).json({ message: "The last admin role cannot be removed." });
    }
    user.role = role;
    await user.save();
    const safeUser = await User.findById(user._id).select(SAFE_USER_FIELDS).lean();
    return res.status(200).json({ message: "User role updated successfully.", user: safeUser });
  } catch (error) { return handleError(res, error, "Unable to update user role."); }
}

module.exports = {
  getDashboard,
  listDestinations, getDestination, createDestination, updateDestination, deleteDestination,
  listPackages, getPackage, createPackage, updatePackage, deletePackage,
  listDepartures, getDeparture, createDeparture, updateDeparture, deleteDeparture,
  listBookings, getBooking, updateBookingStatus,
  listPayments, getPayment,
  listUsers, getUser, updateUserRole,
};
