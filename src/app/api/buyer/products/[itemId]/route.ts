// app/api/products/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";

connect();

export async function GET(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const itemId = params.itemId;
    
    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(itemId)
      .populate("seller", "username pincode sku");

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Format the response to match your frontend expectations
    const responseData = {
      _id: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      itemQuantity: product.itemQuantity,
      description: product.description,
      category: product.category,
      variety: product.variety,
      nutrition: {
        calories: product.nutrition.calories,
        protein: product.nutrition.protein,
      },
      minerals: product.minerals,
      pricing: {
        basePrice: product.pricing.basePrice,
        discountedPrice: product.pricing.discountedPrice,
        currency: product.pricing.currency,
        bulkPricing: product.pricing.bulkPricing || [],
      },
      seller: product.seller
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}