import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";

// Ensure database connection
connect();

export async function GET(request: NextRequest) {
  try {
    // Extract user ID from token
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token or user ID not found" }, { status: 401 });
    }

    // Fetch seller details (excluding password if present)
    const seller = await Seller.findById(userId).select("-password");
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Seller found",
      data: {
        id: seller._id,
        email: seller.email,
        name: seller.name, // if available
        role: "Seller",
      },
    });

  }  catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 400 });
}
}
