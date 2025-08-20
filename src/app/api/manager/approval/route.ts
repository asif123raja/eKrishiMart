// // routes/approval.js
// import connect from '@/dbConfig/dbConfig';
// import PendingProduct from '@/models/pendingProductModel';
// import Product from '@/models/productModel';
// import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';
// import Warehouse from '@/models/warehouseModel';

// connect();

// // Manager approves product
// export async function POST(request: NextRequest) {
//   try {
//     // Verify manager token
//     const cookieStore =await cookies();
//     const token = cookieStore.get('token')?.value;
    
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string, role: string };
    
//     if (decoded.role !== 'manager') {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     const { productId, action, reason } = await request.json();
    
//     // Find pending product
//     const pendingProduct = await PendingProduct.findById(productId);
//     if (!pendingProduct) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Verify manager oversees this warehouse
//     const warehouse = await Warehouse.findOne({ 
//       _id: pendingProduct.warehouseId, 
//       manager: decoded.id 
//     });
    
//     if (!warehouse) {
//       return NextResponse.json({ error: "Not authorized to review this product" }, { status: 403 });
//     }

//     if (action === 'approve') {
//       // Create actual product
//       const newProduct = new Product({
//         ...pendingProduct.toObject(),
//         status: 'active'
//       });
//       await newProduct.save();
      
//       // Update pending product
//       pendingProduct.status = 'approved';
//       pendingProduct.reviewedBy = decoded.id;
//       pendingProduct.reviewedAt = new Date();
//       await pendingProduct.save();
      
//       return NextResponse.json({ 
//         message: "Product approved successfully",
//         product: newProduct 
//       });
      
//     } else if (action === 'reject') {
//       pendingProduct.status = 'rejected';
//       pendingProduct.rejectionReason = reason;
//       pendingProduct.reviewedBy = decoded.id;
//       pendingProduct.reviewedAt = new Date();
//       await pendingProduct.save();
      
//       return NextResponse.json({ 
//         message: "Product rejected",
//         product: pendingProduct 
//       });
//     }

//   } catch (error: any) {
//     console.error("Manager dashboard error:", error);
//     return NextResponse.json({ 
//       error: error.message || "Internal server error" 
//     }, { status: 500 });
//   }
// }

import connect from '@/dbConfig/dbConfig';
import PendingProduct from '@/models/pendingProductModel';
import Product from '@/models/productModel';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

connect();

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { pendingProductId, action } = await request.json();

    if (!pendingProductId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Find the pending document
    const pendingProduct = await PendingProduct.findById(pendingProductId).session(session);
    if (!pendingProduct) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Pending product not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Create a new Product document from the pending data
      const newProduct = new Product({
        // Map all the relevant fields from pendingProduct to Product
        sellerId: pendingProduct.sellerId,
        sku: pendingProduct.sku,
        name: pendingProduct.name,
        description: pendingProduct.description,
        category: pendingProduct.category,
        variety: pendingProduct.variety,
        itemQuantity: pendingProduct.itemQuantity,
        expiryDate: pendingProduct.expiryDate,
        imageUrl: pendingProduct.imageUrl,
        nutrition: pendingProduct.nutrition,
        vitamins: pendingProduct.vitamins,
        minerals: pendingProduct.minerals,
        pricing: pendingProduct.pricing,
        // Add default values for clearance fields from your Product schema
        placement: 'main',
        isClearance: false,
        clearanceThresholdDays: 3, // Or whatever default you set
      });

      await newProduct.save({ session });
      
      // Delete the pending product document
      await PendingProduct.findByIdAndDelete(pendingProductId, { session });

    } else if (action === 'reject') {
      // If rejected, just delete the pending product
      await PendingProduct.findByIdAndDelete(pendingProductId, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      message: `Product successfully ${action}d.`,
      success: true,
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}