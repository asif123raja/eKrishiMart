// import { NextRequest, NextResponse } from 'next/server';
// import connect from '@/dbConfig/dbConfig';
// import Order from '@/models/orderModel';
// import { getDataFromToken } from '@/helper/getDataFromToken';

// connect();

// export async function GET(request: NextRequest) {
//   try {
//     // 1. Authenticate the manager from their token
//     const tokenData = await getDataFromToken(request);
//     if (tokenData.userType !== 'manager' || !tokenData.warehouseId) {
//       return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
//     }
//     const managerWarehouseId = tokenData.warehouseId;

//     // 2. Find all orders containing at least one product from the manager's warehouse
//     // We only fetch orders that are not yet delivered or cancelled
//     const orders = await Order.find({
//       'products.warehouseId': managerWarehouseId,
//       'orderStatus': { $nin: ['delivered', 'cancelled', 'rejected'] }
//     })
//     .sort({ createdAt: -1 })
//     .populate('buyerId', 'username'); // Get the buyer's name

//     return NextResponse.json({ success: true, orders });

//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Seller from '@/models/sellerModel'; // Import Seller model
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getDataFromToken(request);
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

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}