
import mongoose from "mongoose";

// Type for our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to cache the connection
let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };

async function connect() {
  // Check if we already have a cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // Check if MongoDB URI is set
  if (!process.env.MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable");
  }

  // Create a new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise
    cached.conn = await cached.promise;
    
    // Set up event listeners
    cached.conn.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    cached.conn.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      // Don't exit process in production - let the application handle reconnection
      if (process.env.NODE_ENV !== "production") {
        process.exit(1);
      }
    });

    cached.conn.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    return cached.conn;
  } catch (error) {
    // Reset cache if connection fails
    cached.promise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

// Cache the connection in global scope to prevent multiple connections
if (process.env.NODE_ENV !== "production") {
  (global as any).mongoose = cached;
}

export default connect;




// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { getDataFromToken } from '@/helper/getDataFromToken'

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname
//   const token = request.cookies.get('token')?.value || ''

//   // Public paths (no token required)
//   const isPublicPath = [
//     '/login',
//     '/signup',
//     '/verifyemail',
//     '/asignup' // Assuming this is also public
//   ].includes(path)

//   // 1. Redirect logged-in users from public paths
//   if (isPublicPath && token) {
//     return NextResponse.redirect(new URL('/login', request.nextUrl))
//   }

//   // 2. Protect private routes
//   if (!isPublicPath && !token) {
//     return NextResponse.redirect(new URL('/login', request.nextUrl))
//   }

//   // 3. Role-based protection for seller routes
//   if (path.startsWith('/seller') || path.startsWith('/api/seller')) {
//     try {
//       const userId = await getDataFromToken(request)
//       if (!userId) throw new Error('Unauthorized')

//       // Verify user is actually a seller
//       const sellerCheck = await fetch(`${request.nextUrl.origin}/api/check/me2`, {
//         headers: { Cookie: `token=${token}` }
//       })
      
//       if (!sellerCheck.ok) {
//         return NextResponse.redirect(new URL('/unauthorized', request.nextUrl))
//       }
//     } catch (error) {
//       return NextResponse.redirect(new URL('/login', request.nextUrl))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/',
//     '/profile',
//     '/login',
//     '/signup',
//     '/asignup',
//     '/verifyemail',
//     '/seller/:path*',
//     '/api/seller/:path*',
//     '/buyer/:path*'
//   ]
// }