import connect from '@/dbConfig/dbConfig';
import PendingProduct from '@/models/pendingProductModel';
import Product from '@/models/productModel';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';



export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connect();
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

  }  catch (error: unknown) {
    await session.abortTransaction();
    session.endSession();

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}