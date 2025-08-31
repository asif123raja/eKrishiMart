import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import Product from "@/models/productModel";
import { getDataFromToken } from "@/helper/getDataFromToken";


export async function POST(req: NextRequest) {
  try {
    await connect();
    const tokenData = await getDataFromToken(req);
    
    if (!tokenData || !tokenData.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const buyerId = tokenData.id; // ✅ From token, not request body
    
    const body = await req.json();
    const { productId, sku, quantity } = body; // ✅ REMOVED buyerId from destructuring

    // ✅ Updated validation - no longer checking for buyerId
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: productId and quantity are required" },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update buyer's cart
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    const existingItem = buyer.cart.find(
      (item: any) => item.productId.toString() === productId && item.sku === (sku || "DEFAULT")
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      buyer.cart.push({
        productId,
        sku: sku || "DEFAULT",
        quantity,
        addedAt: new Date()
      });
    }

    await buyer.save();

    return NextResponse.json({
      success: true,
      cart: buyer.cart
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const buyerId = req.nextUrl.searchParams.get("buyerId");
    if (!buyerId) {
      return NextResponse.json(
        { error: "buyerId is required" },
        { status: 400 }
      );
    }

    const buyer = await Buyer.findById(buyerId)
      .populate("cart.productId", "name image description calories protein price discounted_price")
      .select("cart");

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      items: buyer.cart.map((item: any) => ({
        _id: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        description: item.productId.description,
        calories: item.productId.calories,
        protein: item.productId.protein,
        price: item.productId.discounted_price || item.productId.price,
        amount: item.quantity,
        sku: item.sku
      }))
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}