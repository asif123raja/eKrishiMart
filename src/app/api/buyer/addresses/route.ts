import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";



// POST - Add a new shipping address
// In your PUT/POST endpoints:
export async function POST(request: NextRequest) {
  try {
    await connect();
    const tokenData = getDataFromToken(request);
    if (!tokenData || !tokenData.id) {
        return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }
    const buyerId = tokenData.id;
    // const { _id, ...newAddress } = await request.json(); // Destructure properly
    const { __id, ...newAddress } = await request.json();
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

  }catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}

// PUT - Update an existing shipping address
export async function PUT(request: NextRequest) {
    try {
        const tokenData = getDataFromToken(request);
        if (!tokenData || !tokenData.id) {
          return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }
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

    } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
        return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
    }
}