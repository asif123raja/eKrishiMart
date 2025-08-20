import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

export async function GET(
  request: NextRequest, 
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // 1. Authenticate the user from their token
    const tokenData = await getDataFromToken(request);
    const buyerId = tokenData.id;
    if (!buyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the order, ensuring it belongs to the logged-in user
    const order = await Order.findOne({
      _id: orderId,
      buyerId: buyerId // Security check: user can only see their own orders
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }
    
    // The deliveryPasscode is set to `select: false` in the schema.
    // To retrieve it here, we need to explicitly ask for it.
    const orderWithPasscode = await Order.findOne({
      _id: orderId,
      buyerId: buyerId
    }).select('+deliveryPasscode');


    return NextResponse.json({ 
        success: true, 
        order: orderWithPasscode
    });

  } catch (error: any) {
    if (error.kind === 'ObjectId') {
        return NextResponse.json({ error: "Invalid Order ID format" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}