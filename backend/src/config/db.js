import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    mongoose.connection.on("error", (error) => {
      console.error(`MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production"
    });

    console.log(`MongoDB connected successfully: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
