import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user from their token
    const tokenData = await getDataFromToken(request);
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

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}