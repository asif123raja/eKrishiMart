import connect from '@/dbConfig/dbConfig';
import PendingProduct from '@/models/pendingProductModel';
import { NextResponse } from 'next/server';

connect();

export async function GET() {
  try {
    const pendingProducts = await PendingProduct.find({ status: 'pending' })
      .populate('sellerId', 'username businessName') // Get seller's name for display
      .sort({ createdAt: -1 }); // Show newest first

    return NextResponse.json(pendingProducts);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}