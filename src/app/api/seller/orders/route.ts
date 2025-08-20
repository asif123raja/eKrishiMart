import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Order from "@/models/orderModel";

// Connect to the database
connect();

export async function GET(request: NextRequest) {
  try {
    // 1. Get the seller's ID from the authentication token
    const sellerId = await getDataFromToken(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Find all orders containing at least one product from this seller
    // We use $elemMatch to find documents where the products array contains
    // at least one element matching the sellerId condition.
    const orders = await Order.find({
      "products.sellerId": sellerId,
    })
    .populate({ // Populate buyer information for display
        path: "buyerId",
        select: "username email", // Select only the fields you need
    })
    .sort({ createdAt: -1 }); // Show the newest orders first

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { message: "No orders found for this seller" },
        { status: 200 }
      );
    }

    // 3. Return the found orders
    return NextResponse.json({
      message: "Orders fetched successfully",
      orders: orders,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}