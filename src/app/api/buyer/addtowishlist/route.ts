// import { NextRequest, NextResponse } from "next/server";
// import connect from "@/dbConfig/dbConfig";
// import Buyer from "@/models/userModel";
// import Product from "@/models/productModel";

// connect();

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log("request body in wishlist route:", body);
//     const { buyerId, productId } = body;

//     if (!buyerId || !productId) {
//       return NextResponse.json({ error: "Missing buyerId or productId" }, { status: 400 });
//     }

//     const buyer = await Buyer.findById(buyerId);
//     if (!buyer) {
//       return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
//     }

//     const alreadyExists = buyer.wishlist.some(
//       (item: any) => item.productId.toString() === productId
//     );

//     if (alreadyExists) {
//       return NextResponse.json({ message: "Item already in wishlist" });
//     }

//     // Get product to fetch SKU
//     const product = await Product.findById(productId).select("sku");
//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Add to wishlist with productId and sku
//     buyer.wishlist.push({ productId: product._id, sku: product.sku });
//     await buyer.save();

//     return NextResponse.json({ success: true, message: "Item added to wishlist" });

//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import Product from "@/models/productModel";

connect();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerId, productId } = body;

    if (!buyerId || !productId) {
      return NextResponse.json(
        { error: "Missing buyerId or productId" },
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

    // Update buyer's wishlist
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const alreadyExists = buyer.wishlist.some(
      (item: any) => item.productId.toString() === productId
    );

    if (alreadyExists) {
      return NextResponse.json({
        success: false,
        message: "Item already in wishlist"
      });
    }

    // Add to wishlist
    buyer.wishlist.push({
      productId,
      sku: product.sku || "DEFAULT",
      addedAt: new Date()
    });

    await buyer.save();

    return NextResponse.json({
      success: true,
      wishlist: buyer.wishlist
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
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
      .populate("wishlist.productId", "name image description calories protein price discounted_price")
      .select("wishlist");

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      items: buyer.wishlist.map((item: any) => ({
        _id: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        description: item.productId.description,
        calories: item.productId.calories,
        protein: item.productId.protein,
        price: item.productId.discounted_price || item.productId.price,
        sku: item.sku
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}