import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Seller from '@/models/sellerModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getDataFromToken(request);
    if (tokenData.userType !== 'manager' || !tokenData.warehouseId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    const managerWarehouseId = tokenData.warehouseId;

    // Find only orders that are delivered or cancelled
    const orders = await Order.find({
      'products.warehouseId': managerWarehouseId,
      'orderStatus': { $in: ['delivered', 'cancelled'] }
    })
    .sort({ createdAt: -1 })
    .populate('buyerId', 'username');

    return NextResponse.json({ success: true, orders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}