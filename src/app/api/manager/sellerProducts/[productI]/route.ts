// import { NextRequest, NextResponse } from "next/server";
// import Warehouse from "@/models/warehouseModel";
// import Seller from "@/models/sellerModel";
// import Product from "@/models/productModel";
// import connect from "@/dbConfig/dbConfig";
// import { Types } from "mongoose";

// connect();

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { productId: string } }
// ) {
//   try {
//     const managerId = req.headers.get('x-user-id');
    
//     if (!managerId || !Types.ObjectId.isValid(managerId)) {
//       return NextResponse.json({ error: "Invalid Manager ID" }, { status: 401 });
//     }

//     const { quantity } = await req.json();
    
//     if (typeof quantity !== 'number' || quantity < 0) {
//       return NextResponse.json(
//         { error: "Invalid quantity value" },
//         { status: 400 }
//       );
//     }

//     // Verify manager's warehouse
//     const warehouse = await Warehouse.findOne({ 
//       "manager._id": new Types.ObjectId(managerId) 
//     }).select("serviceablePincodes");

//     if (!warehouse) {
//       return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
//     }

//     // Get product with seller info
//     const product = await Product.findById(params.productId)
//       .populate<{ sellerId: { businessAddress: { pincode: string } } }>({
//         path: 'sellerId',
//         select: 'businessAddress.pincode'
//       });

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Check if seller's pincode is in warehouse's serviceable pincodes
//     if (!warehouse.serviceablePincodes.includes(product.sellerId.businessAddress.pincode)) {
//       return NextResponse.json(
//         { error: "Not authorized to update this product" },
//         { status: 403 }
//       );
//     }

//     // Update product
//     const updatedProduct = await Product.findByIdAndUpdate(
//       params.productId,
//       { itemQuantity: quantity },
//       { new: true }
//     ).select("name sku itemQuantity");

//     return NextResponse.json({
//       message: "Quantity updated successfully",
//       product: {
//         _id: updatedProduct._id.toString(),
//         name: updatedProduct.name,
//         sku: updatedProduct.sku,
//         quantity: updatedProduct.itemQuantity
//       }
//     }, { status: 200 });

//   } catch (error: any) {
//     console.error("Error in PUT /api/manager/sellerProducts:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import Warehouse from "@/models/warehouseModel";
import Product from "@/models/productModel";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";

connect();

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const managerEmail = req.headers.get('x-user-id');
    
    // ✅ FIX: Check for a valid string, not an ObjectId
    if (!managerEmail) {
      return NextResponse.json({ error: "Manager Email not provided" }, { status: 401 });
    }

    const { quantity } = await req.json();
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity value" }, { status: 400 });
    }

    // ✅ FIX: Find the warehouse by the manager's email
    const warehouse = await Warehouse.findOne({ 
      "manager.email": managerEmail 
    }).select("serviceablePincodes");

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found for this manager" }, { status: 404 });
    }

    const product = await Product.findById(params.productId)
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
      params.productId, 
      { itemQuantity: quantity },
      { new: true }
    ).select("itemQuantity");
    
    return NextResponse.json({ 
        message: "Quantity updated successfully",
        product: {
            quantity: updatedProduct.itemQuantity
        }
    }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/manager/sellerProducts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}