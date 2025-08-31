// import { NextRequest, NextResponse } from 'next/server';
// import connect from '@/dbConfig/dbConfig';
// import Order from '@/models/orderModel';
// import { getDataFromToken } from '@/helper/getDataFromToken';

// connect();

// export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
//   try {
//     const { orderId } = params;
//     const { action, payload } = await request.json();

//     // 1. Authenticate the manager
//     const tokenData = await getDataFromToken(request);
//     if( !tokenData || !tokenData.id){
//       return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
//     }
//     if (tokenData.userType !== 'manager' || !tokenData.warehouseId) {
//       return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
//     }

//     // 2. Find the order and verify it belongs to the manager's warehouse
//     // We fetch with the passcode only when needed for completion
//     const order = await Order.findOne({ 
//         _id: orderId,
//         'products.warehouseId': tokenData.warehouseId 
//     }).select(action === 'complete_order' ? '+deliveryPasscode' : '');

//     if (!order) {
//       return NextResponse.json({ error: "Order not found or not assigned to your warehouse" }, { status: 404 });
//     }
    
//     // 3. Perform the requested action
//     switch (action) {
//       case 'update_status':
//         if (!payload.newStatus) throw new Error("New status is required.");
//         order.orderStatus = payload.newStatus;
//         break;

//       case 'complete_order':
//         if (!payload.passcode) throw new Error("Delivery passcode is required.");
//         if (payload.passcode !== order.deliveryPasscode) {
//           return NextResponse.json({ error: "Invalid delivery passcode" }, { status: 400 });
//         }
//         order.orderStatus = 'delivered';
//         if(order.paymentDetails) order.paymentDetails.status = 'completed'; // Mark COD as completed
//         break;

//       default:
//         throw new Error("Invalid action specified.");
//     }
    
//     const updatedOrder = await order.save();

//     return NextResponse.json({ success: true, order: updatedOrder });

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//     return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

// ✅ Correct interface for Next.js App Router
interface Context {
  params: Promise<{ orderId: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    // ✅ Await the params promise
    const { orderId } = await context.params;
    const { action, payload } = await request.json();

    // 1. Authenticate the manager
    const tokenData = await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
      return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }
    if (tokenData.userType !== 'manager' || !tokenData.warehouseId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // 2. Find the order and verify it belongs to the manager's warehouse
    // We fetch with the passcode only when needed for completion
    const order = await Order.findOne({ 
        _id: orderId,
        'products.warehouseId': tokenData.warehouseId 
    }).select(action === 'complete_order' ? '+deliveryPasscode' : '');

    if (!order) {
      return NextResponse.json({ error: "Order not found or not assigned to your warehouse" }, { status: 404 });
    }
    
    // 3. Perform the requested action
    switch (action) {
      case 'update_status':
        if (!payload.newStatus) throw new Error("New status is required.");
        order.orderStatus = payload.newStatus;
        break;

      case 'complete_order':
        if (!payload.passcode) throw new Error("Delivery passcode is required.");
        if (payload.passcode !== order.deliveryPasscode) {
          return NextResponse.json({ error: "Invalid delivery passcode" }, { status: 400 });
        }
        order.orderStatus = 'delivered';
        if(order.paymentDetails) order.paymentDetails.status = 'completed'; // Mark COD as completed
        break;

      default:
        throw new Error("Invalid action specified.");
    }
    
    const updatedOrder = await order.save();

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}