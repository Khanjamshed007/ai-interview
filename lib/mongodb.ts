import { MongoClient } from "mongodb";


const MONGODB_URI = process.env.MONGODB_URI || "";
export async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    return client.db("ai_interview"); // Replace with your actual database name
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

