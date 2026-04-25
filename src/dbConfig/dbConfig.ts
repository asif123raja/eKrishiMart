
// import mongoose from "mongoose";

// // Type for our cached connection
// interface MongooseCache {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// // Global variable to cache the connection
// let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };

// async function connect() {
//   // Check if we already have a cached connection
//   if (cached.conn) {
//     return cached.conn;
//   }

//   // Check if MongoDB URI is set
//   if (!process.env.MONGO_URI) {
//     throw new Error("Please define the MONGO_URI environment variable");
//   }

//   // Create a new connection promise if none exists
//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false, // Disable mongoose buffering
//     };

//     cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   try {
//     // Await the connection promise
//     cached.conn = await cached.promise;
    
//     // Set up event listeners
//     cached.conn.connection.on("connected", () => {
//       console.log("MongoDB connected successfully");
//     });

//     cached.conn.connection.on("error", (err) => {
//       console.error("MongoDB connection error:", err);
//       // Don't exit process in production - let the application handle reconnection
//       if (process.env.NODE_ENV !== "production") {
//         process.exit(1);
//       }
//     });

//     cached.conn.connection.on("disconnected", () => {
//       console.log("MongoDB disconnected");
//     });

//     return cached.conn;
//   } catch (error) {
//     // Reset cache if connection fails
//     cached.promise = null;
//     console.error("MongoDB connection failed:", error);
//     throw error;
//   }
// }

// // Cache the connection in global scope to prevent multiple connections
// if (process.env.NODE_ENV !== "production") {
//   (global as any).mongoose = cached;
// }

// export default connect;
import mongoose from "mongoose";

export default async function connect() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not defined - skipping DB connection");
    return;
  }

  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}