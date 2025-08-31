import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";


// GET: To fetch the current seller's profile data
export async function GET(request: NextRequest) {
  try {
    await connect();
        console.log("✅ DB Connected");
    const tokendata=getDataFromToken(request);
    const sellerId = tokendata?.id;
    const seller = await Seller.findById(sellerId).select("-password"); // Exclude password for security

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Seller data fetched successfully",
      success: true,
      data: seller,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: To update the seller's profile
export async function PUT(request: NextRequest) {
  try {
    const tokendata=getDataFromToken(request);
    const sellerId = tokendata?.id;
    const reqBody = await request.json();
    const { contactNumber, businessAddress,paymentDetails } = reqBody;

    // Basic validation
    if (!contactNumber || !businessAddress) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { contactNumber, businessAddress,paymentDetails },
      { new: true, runValidators: true } // Return the updated document
    ).select("-password");

    if (!updatedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      success: true,
      data: updatedSeller,
    });

  } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}