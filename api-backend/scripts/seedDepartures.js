require("dotenv").config();

const mongoose = require("mongoose");

const TourPackage = require("../models/TourPackage");
const Departure = require("../models/Departure");

const MONGO_URI = process.env.MONGO_URI;

const departureTemplates = [
  {
    daysFromNow: 30,
    capacity: 12,
    notes: "Spring departure.",
  },
  {
    daysFromNow: 60,
    capacity: 12,
    notes: "Early summer departure.",
  },
  {
    daysFromNow: 90,
    capacity: 15,
    notes: "Summer departure.",
  },
];

async function seedDepartures() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected");

    // --------------------------------------------------
    // Get active tour packages
    // --------------------------------------------------

    const packages = await TourPackage.find({
      status: "active",
    }).select("_id title");

    if (!packages.length) {
      console.log(
        "No active tour packages found."
      );

      return;
    }

    console.log(
      `Found ${packages.length} active tour packages.`
    );

    // --------------------------------------------------
    // Remove existing seeded/open departures
    // --------------------------------------------------

    await Departure.deleteMany({
      tourPackage: {
        $in: packages.map(
          (tourPackage) =>
            tourPackage._id
        ),
      },
      departureDate: {
        $gt: new Date(),
      },
    });

    // --------------------------------------------------
    // Create departures
    // --------------------------------------------------

    const departures = [];

    for (const tourPackage of packages) {
      for (const template of departureTemplates) {
        const departureDate =
          new Date();

        departureDate.setDate(
          departureDate.getDate() +
            template.daysFromNow
        );

        // Set departure time to 09:00 local/server time.
        departureDate.setHours(
          9,
          0,
          0,
          0
        );

        departures.push({
          tourPackage:
            tourPackage._id,

          departureDate,

          capacity:
            template.capacity,

          bookedSeats: 0,

          status: "open",

          notes:
            template.notes,
        });
      }
    }

    const created =
      await Departure.insertMany(
        departures
      );

    console.log(
      `Created ${created.length} departures.`
    );

    // --------------------------------------------------
    // Display created departures
    // --------------------------------------------------

    for (const departure of created) {
      const tourPackage =
        packages.find(
          (pkg) =>
            pkg._id.toString() ===
            departure.tourPackage.toString()
        );

      console.log(
        `✓ ${tourPackage.title} → ${departure.departureDate.toISOString()} (${departure.capacity} seats)`
      );
    }
  } catch (error) {
    console.error(
      "Departure seeding failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB Disconnected"
    );
  }
}

seedDepartures();