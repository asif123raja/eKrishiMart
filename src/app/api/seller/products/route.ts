import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/productModel";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

export async function GET(req: NextRequest) {
  try {
    // Get userId from headers
    // const userId = req.headers.get('x-user-id');
    const response= await getDataFromToken(req);
    const userId = response?.id;
    console.log("userId from token", userId)
    if (!userId) {
      return NextResponse.json({ error: "User ID not provided" }, { status: 401 });
    }

    // Find seller and products
    const [seller, products] = await Promise.all([
      Seller.findById(userId).select("sku"),
      Product.find({ sellerId: userId }).select("name imageUrl sku itemQuantity")
    ]);

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Format response
    const formattedProducts = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      sellerSku: seller.sku,
      itemQuantity: product.itemQuantity,
      image: product.imageUrl || null
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });

  } catch (error: any) {
    console.error("Error in GET /api/seller/products:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

