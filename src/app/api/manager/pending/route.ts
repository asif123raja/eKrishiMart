// import connect from '@/dbConfig/dbConfig';
// import PendingProduct from '@/models/pendingProductModel';
// import { NextResponse } from 'next/server';

// connect();

// export async function GET() {
//   try {
//     const pendingProducts = await PendingProduct.find({
//       $or: [
//         { status: 'pending' },
//         { status: 'awaiting-payment' }
//       ]
//     })
//       .populate('sellerId', 'username businessName')
//       .sort({ createdAt: -1 });

//     return NextResponse.json(pendingProducts);

//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import connect from '@/dbConfig/dbConfig';
import PendingProduct from '@/models/pendingProductModel';
import { NextResponse } from 'next/server';

connect();

export async function GET() {
  try {
    await connect();
    const pendingProducts = await PendingProduct.find({
      status: { $in: ['pending', 'awaiting-payment'] } // More efficient query
    })
    .populate({
      path: 'sellerId',
      // ✅ Select all the fields you need from the Seller model
      select: 'username businessName businessAddress paymentDetails contactNumber' 
    })
    .sort({ createdAt: -1 });

    return NextResponse.json(pendingProducts);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}