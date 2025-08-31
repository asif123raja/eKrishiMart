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
        if( !tokenData || !tokenData.id){
                   return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
       }
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

  } catch (error: unknown) {
    // First, check if the error is a standard Error object
    if (error instanceof Error) {
        // Now that we know it's an error, we can check for Mongoose-specific properties.
        // We use a type assertion here to check the 'kind' property.
        if ((error as any).kind === 'ObjectId') {
            return NextResponse.json({ error: "Invalid ID format. Please check the ID." }, { status: 400 });
        }
        // For all other standard errors, return the general message.
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}