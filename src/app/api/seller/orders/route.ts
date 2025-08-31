import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Order from "@/models/orderModel";

// Connect to the database


export async function GET(request: NextRequest) {
  try {
    await connect();
        console.log("✅ DB Connected");
    // 1. Get the seller's ID from the authentication token
    const tokenData= await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
          return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }
    const sellerId = tokenData.id;
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
    
 } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}