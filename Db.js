import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.URI


let isConnected = false;

export const connectToDb = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log("MongoDB Connected:", isConnected);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};


export const disconnectDb = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB Disconnected");
      isConnected = false;
    }
  } catch (err) {
    console.error("DB disconnect error:", err.message);
  }
};

 
