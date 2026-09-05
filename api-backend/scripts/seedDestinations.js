require("dotenv").config();

const mongoose = require("mongoose");
const Destination = require("../models/Destination");

const destinations = [
  {
    name: "Kashmir",
    country: "India",
    description:
      "Lakes, valleys, alpine landscapes, and quiet mountain escapes.",
    imageUrl:
      "https://images.unsplash.com/photo-1595815771614-ade9d2a1c2d7?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Dal Lake",
      "Gulmarg",
      "Pahalgam",
      "Sonamarg",
      "Srinagar",
    ],
  },
  {
    name: "Ladakh",
    country: "India",
    description:
      "High-altitude roads, dramatic mountains, monasteries, and endless horizons.",
    imageUrl:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Leh",
      "Nubra Valley",
      "Pangong Lake",
      "Khardung La",
      "Thiksey Monastery",
    ],
  },
  {
    name: "Kerala",
    country: "India",
    description:
      "Backwaters, forests, coastal villages, and a slower way of travelling.",
    imageUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Alleppey",
      "Munnar",
      "Wayanad",
      "Kovalam",
      "Thekkady",
    ],
  },
  {
    name: "Goa",
    country: "India",
    description:
      "Coastal roads, quiet beaches, old Portuguese towns, and unhurried evenings.",
    imageUrl:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "North Goa",
      "South Goa",
      "Palolem",
      "Old Goa",
      "Dudhsagar Falls",
    ],
  },
  {
    name: "Himachal Pradesh",
    country: "India",
    description:
      "Pine forests, mountain villages, winding roads, and slow Himalayan mornings.",
    imageUrl:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Manali",
      "Kasol",
      "Spiti Valley",
      "Dharamshala",
      "Kinnaur",
    ],
  },
  {
    name: "Meghalaya",
    country: "India",
    description:
      "Living root bridges, misty hills, waterfalls, and some of India's wildest landscapes.",
    imageUrl:
      "https://images.unsplash.com/photo-1625736306349-5f2e7a8f6f9c?auto=format&fit=crop&w=1600&q=85",
    highlights: [
      "Shillong",
      "Cherrapunji",
      "Mawlynnong",
      "Dawki",
      "Nongriat",
    ],
  },
];

async function seedDestinations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Destination.deleteMany({});

    const createdDestinations =
      await Destination.insertMany(destinations);

    console.log(
      `Seeded ${createdDestinations.length} destinations.`
    );

    createdDestinations.forEach((destination) => {
      console.log(
        `✓ ${destination.name} (${destination._id})`
      );
    });

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");
    process.exit(0);
  } catch (error) {
    console.error(
      "Destination seeding failed:",
      error
    );

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

seedDestinations();