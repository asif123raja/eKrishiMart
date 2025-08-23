import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";
// ✅ 1. Import the correct model
import PendingProduct from "@/models/pendingProductModel"; 

connect();

export async function GET(request: NextRequest) {
  try {
    // 2. Get the seller's ID from their login token
    const response = await getDataFromToken(request);
    const sellerId = response.id;
    if (!sellerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ✅ 3. Query the PendingProduct collection for the seller's items
    // We only need to filter by sellerId now, as all items in this collection are part of the approval workflow.
    const pendingProducts = await PendingProduct.find({
      sellerId: sellerId
    }).sort({ createdAt: -1 }); // Show the most recently added products first

    return NextResponse.json({
      message: "Pending products fetched successfully",
      products: pendingProducts,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}