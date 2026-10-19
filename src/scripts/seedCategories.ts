import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import categories from "../data/categories.js";
import Category from "../models/Category.js";

try {
  await connectDB();
  await Category.bulkWrite(
    categories.map((category) => ({
      updateOne: {
        filter: { id: category.id },
        update: { $set: category },
        upsert: true,
      },
    })),
  );
  console.log(`Seeded ${categories.length} item categories`);
} catch (error) {
  console.error("Failed to seed item categories:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
