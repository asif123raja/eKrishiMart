import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

// POST - Add a new shipping address
// In your PUT/POST endpoints:
export async function POST(request: NextRequest) {
  try {
    const tokenData = await getDataFromToken(request);
    const buyerId = tokenData.id;
    const { _id, ...newAddress } = await request.json(); // Destructure properly

    // Validate required fields
    const required = ['addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!newAddress[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // For POST (add new)
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      buyerId,
      { $push: { shippingAddresses: newAddress } },
      { new: true }
    );

    return NextResponse.json({
      shippingAddresses: updatedBuyer.shippingAddresses
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing shipping address
export async function PUT(request: NextRequest) {
    try {
        const tokenData = await getDataFromToken(request);
        const buyerId = tokenData.id;
        if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const addressToUpdate = await request.json();
        const addressId = addressToUpdate._id; // The ID of the sub-document

        if (!addressId) {
            return NextResponse.json({ error: "Address ID is required for update" }, { status: 400 });
        }

        // Use the positional operator '$' with arrayFilters to update the specific address
        const result = await Buyer.updateOne(
            { _id: buyerId, "shippingAddresses._id": addressId },
            { 
                $set: { 
                    "shippingAddresses.$": addressToUpdate 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Buyer or address not found" }, { status: 404 });
        }
        
        // Fetch the updated addresses to send back to the client
        const updatedBuyer = await Buyer.findById(buyerId).select("shippingAddresses");

        return NextResponse.json({
            message: "Address updated successfully",
            shippingAddresses: updatedBuyer.shippingAddresses,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}