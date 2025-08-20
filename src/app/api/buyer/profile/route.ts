import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    // Get the user's ID from their authentication token
    const tokenData = await getDataFromToken(request);
    const buyerId = tokenData.id;

    if (!buyerId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Find the buyer by ID and exclude the password for security
    const buyer = await Buyer.findById(buyerId).select("-password");

    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User profile found",
      user: buyer,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}