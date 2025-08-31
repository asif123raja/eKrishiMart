// import { NextRequest, NextResponse } from "next/server";
// import Warehouse from "@/models/warehouseModel";
// import Product from "@/models/productModel";
// import Seller from "@/models/sellerModel";
// import connect from "@/dbConfig/dbConfig";

// connect();

// export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
//   try {
//     const managerEmail = req.headers.get('x-user-id');
    
//     // ✅ FIX: Check for a valid string, not an ObjectId
//     if (!managerEmail) {
//       return NextResponse.json({ error: "Manager Email not provided" }, { status: 401 });
//     }

//     const { quantity } = await req.json();
//     if (typeof quantity !== 'number' || quantity < 0) {
//       return NextResponse.json({ error: "Invalid quantity value" }, { status: 400 });
//     }

//     // ✅ FIX: Find the warehouse by the manager's email
//     const warehouse = await Warehouse.findOne({ 
//       "manager.email": managerEmail 
//     }).select("serviceablePincodes");

//     if (!warehouse) {
//       return NextResponse.json({ error: "Warehouse not found for this manager" }, { status: 404 });
//     }

//     const product = await Product.findById(params.productId)
//       .populate<{ sellerId: { businessAddress: { pincode: string } } }>({
//         path: 'sellerId',
//         model: Seller,
//         select: 'businessAddress.pincode'
//       });

//     if (!product || !product.sellerId) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     if (!warehouse.serviceablePincodes.includes(product.sellerId.businessAddress.pincode)) {
//       return NextResponse.json({ error: "Not authorized to update this product" }, { status: 403 });
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       params.productId, 
//       { itemQuantity: quantity },
//       { new: true }
//     ).select("itemQuantity");
    
//     return NextResponse.json({ 
//         message: "Quantity updated successfully",
//         product: {
//             quantity: updatedProduct.itemQuantity
//         }
//     }, { status: 200 });
//   } catch (error: unknown) {
//     console.error("PUT /api/manager/sellerProducts Error:", error);

//     // Check if the caught item is a standard Error object
//     if (error instanceof Error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
    
//     // Fallback for cases where a non-Error was thrown
//     return NextResponse.json({ error: "An unknown internal server error occurred" }, { status: 500 });
// }
// }
import { NextRequest, NextResponse } from "next/server";
import Warehouse from "@/models/warehouseModel";
import Product from "@/models/productModel";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";

connect();

// ✅ Correct interface for Next.js App Router
interface Context {
  params: Promise<{ productId: string }>;
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    // ✅ Await the params promise
    const { productId } = await context.params;
    
    const managerEmail = req.headers.get('x-user-id');
    
    // ✅ Check for a valid string, not an ObjectId
    if (!managerEmail) {
      return NextResponse.json({ error: "Manager Email not provided" }, { status: 401 });
    }

    const { quantity } = await req.json();
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity value" }, { status: 400 });
    }

    // ✅ Find the warehouse by the manager's email
    const warehouse = await Warehouse.findOne({ 
      "manager.email": managerEmail 
    }).select("serviceablePincodes");

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found for this manager" }, { status: 404 });
    }

    const product = await Product.findById(productId)
      .populate<{ sellerId: { businessAddress: { pincode: string } } }>({
        path: 'sellerId',
        model: Seller,
        select: 'businessAddress.pincode'
      });

    if (!product || !product.sellerId) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!warehouse.serviceablePincodes.includes(product.sellerId.businessAddress.pincode)) {
      return NextResponse.json({ error: "Not authorized to update this product" }, { status: 403 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      { itemQuantity: quantity },
      { new: true }
    ).select("itemQuantity");
    
    return NextResponse.json({ 
        message: "Quantity updated successfully",
        product: {
            quantity: updatedProduct.itemQuantity
        }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("PUT /api/manager/sellerProducts Error:", error);

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown internal server error occurred" }, { status: 500 });
  }
}