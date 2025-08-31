import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import { getDataFromToken } from '@/helper/getDataFromToken';



export async function GET(request: NextRequest) {
  try {
    await connect();
    // 1. Authenticate the user from their token
    const tokenData = await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
               return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
            }
    const buyerId = tokenData.id;
    if (!buyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find all orders for the logged-in buyer, sorted newest first
    const orders = await Order.find({ buyerId: buyerId })
      .sort({ createdAt: -1 })
      .populate({
          path: 'products.productId',
          select: 'imageUrl' // Populate to get the product image for display
      });

    return NextResponse.json({
        success: true,
        orders,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}