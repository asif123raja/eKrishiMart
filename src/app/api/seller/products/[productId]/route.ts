// import { NextRequest, NextResponse } from "next/server";
// import { getDataFromToken } from "@/helper/getDataFromToken"; // ✅ Reverted to secure token helper
// import Product from "@/models/productModel";
// import Seller from "@/models/sellerModel";
// import connect from "@/dbConfig/dbConfig";

// connect();

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { productId: string } }
// ) {
//   try {
//     // Get userId from headers
//     // const userId = req.headers.get('x-user-id');
//     const tokenData= await getDataFromToken(req);
//     const userId = tokenData?.id;
//     console.log("userId from token", userId);
//     if (!userId) {
//       return NextResponse.json({ error: "User ID not provided" }, { status: 401 });
//     }

//     // Parse request body
//     const { itemQuantity } = await req.json();
    
//     if (typeof itemQuantity !== 'number' || itemQuantity < 0) {
//       return NextResponse.json(
//         { error: "Invalid quantity value" },
//         { status: 400 }
//       );
//     }

//     // Update product
//     const updatedProduct = await Product.findOneAndUpdate(
//       { _id: params.productId, sellerId: userId },
//       { itemQuantity },
//       { new: true }
//     ).select("name sku itemQuantity image");

//     if (!updatedProduct) {
//       return NextResponse.json(
//         { error: "Product not found or not owned by seller" },
//         { status: 404 }
//       );
//     }

//     // Get seller SKU
//     const seller = await Seller.findById(userId).select("sku");
//     if (!seller) {
//       return NextResponse.json({ error: "Seller not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: "Quantity updated successfully",
//       product: {
//         _id: updatedProduct._id.toString(),
//         name: updatedProduct.name,
//         sku: updatedProduct.sku,
//         sellerSku: seller.sku,
//         itemQuantity: updatedProduct.itemQuantity,
//         image: updatedProduct.image || null
//       }
//     }, { status: 200 });

//   } catch (error: unknown) {
//     console.error("Error in PUT /api/seller/products:", error);

//     // Check if the caught item is a standard Error object
//     if (error instanceof Error) {
//         return NextResponse.json(
//           { error: error.message || "Internal Server Error" },
//           { status: 500 }
//         );
//     }
    
//     // Fallback for cases where a non-Error was thrown
//     return NextResponse.json(
//         { error: "An unknown internal server error occurred" },
//         { status: 500 }
//     );
// }
// }
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Product from "@/models/productModel";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";

connect();

// ✅ Correct interface for Next.js App Router
interface Context {
  params: Promise<{ productId: string }>;
}

export async function PUT(
  req: NextRequest,
  context: Context
) {
  try {
    // ✅ Await the params promise
    const { productId } = await context.params;
    
    // Get userId from token
    const tokenData = await getDataFromToken(req);
    const userId = tokenData?.id;
    console.log("userId from token", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "User ID not provided" }, { status: 401 });
    }

    // Parse request body
    const { itemQuantity } = await req.json();
    
    if (typeof itemQuantity !== 'number' || itemQuantity < 0) {
      return NextResponse.json(
        { error: "Invalid quantity value" },
        { status: 400 }
      );
    }

    // Update product
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, sellerId: userId },
      { itemQuantity },
      { new: true }
    ).select("name sku itemQuantity image");

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found or not owned by seller" },
        { status: 404 }
      );
    }

    // Get seller SKU
    const seller = await Seller.findById(userId).select("sku");
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Quantity updated successfully",
      product: {
        _id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        sellerSku: seller.sku,
        itemQuantity: updatedProduct.itemQuantity,
        image: updatedProduct.image || null
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error in PUT /api/seller/products:", error);

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message || "Internal Server Error" },
          { status: 500 }
        );
    }
    
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json(
        { error: "An unknown internal server error occurred" },
        { status: 500 }
    );
  }
}