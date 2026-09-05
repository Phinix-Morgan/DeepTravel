require("dotenv").config();

const mongoose = require("mongoose");
const Destination = require("../models/Destination");

const imageUpdates = [
  {
    name: "Kashmir",
    imageUrl:
      "https://images.unsplash.com/photo-1569852837213-00d97a707a83?auto=format&fit=crop&w=1600&q=85",
  },
  {
    name: "Ladakh",
    imageUrl:
      "https://images.unsplash.com/photo-1547127678-a8619053611c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    name: "Meghalaya",
    imageUrl:
      "https://images.unsplash.com/photo-1609276804051-8c5e906cc430?auto=format&fit=crop&w=1600&q=85",
  },
];

async function updateDestinationImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    for (const destination of imageUpdates) {
      const updated =
        await Destination.findOneAndUpdate(
          { name: destination.name },
          {
            $set: {
              imageUrl: destination.imageUrl,
            },
          },
          {
            new: true,
          }
        );

      if (!updated) {
        console.log(
          `✗ ${destination.name} not found`
        );
        continue;
      }

      console.log(
        `✓ Updated image: ${updated.name}`
      );
    }

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(
      "Failed to update destination images:",
      error
    );

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

updateDestinationImages();