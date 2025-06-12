import mongoose from "mongoose";

let isConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function connectToDatabase() {
  if (isConnected) {
    console.log("Using existing MongoDB connection, state:", mongoose.connection.readyState);
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "ai_interview", // Replace with your actual database name
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      retryWrites: true,
      w: "majority",
    });
    isConnected = true;
    console.log("Connected to MongoDB, state:", mongoose.connection.readyState);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}