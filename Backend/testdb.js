import "dotenv/config";
import mongoose from "mongoose";

try {
  console.log("Testing MongoDB connection...");

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connection successful!");

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("Connection test failed:");
  console.error(error);
  process.exit(1);
}