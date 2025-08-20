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

  } catch (error: any) {
    console.error("Error fetching seller details:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
