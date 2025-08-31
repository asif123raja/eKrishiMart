import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Seller from '@/models/sellerModel'; // Import Seller model
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
      return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }
    if (tokenData.userType !== 'manager' || !tokenData.warehouseId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    const managerWarehouseId = tokenData.warehouseId;

    // Find only orders that are still active
    const orders = await Order.find({
      'products.warehouseId': managerWarehouseId,
      'orderStatus': { $in: ['pending', 'approved', 'processing', 'shipped', 'out_for_delivery', 'rejected'] }
    })
    .sort({ createdAt: -1 })
    .populate('buyerId', 'username')
    // ✅ NEW: Populate the full seller details for each product
    .populate({
        path: 'products.sellerId',
        model: Seller,
        select: 'businessName contactNumber paymentDetails'
    });

    return NextResponse.json({ success: true, orders });

  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}