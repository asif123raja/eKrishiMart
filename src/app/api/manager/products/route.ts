import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connect from '@/dbConfig/dbConfig';
import Warehouse from '@/models/warehouseModel';
import PendingProduct from '@/models/pendingProductModel';


export async function GET(request: NextRequest) {
  try {
    await connect();
    // Verify manager token - AWAIT added here
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string, role: string };
    
    if (decoded.role !== 'manager') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find warehouse managed by this user
    const warehouse = await Warehouse.findOne({ manager: decoded.id });
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    // Get pending products for this warehouse
    const pendingProducts = await PendingProduct.find({
      warehouseId: warehouse._id,
      status: 'pending'
    }).populate('sellerId', 'name email');

    return NextResponse.json({ products: pendingProducts });

  } catch (error: unknown) {
    console.error("Manager dashboard error:", error);

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ 
            error: error.message || "Internal server error" 
        }, { status: 500 });
    }
    
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ 
        error: "An unknown internal server error occurred" 
    }, { status: 500 });
}
}