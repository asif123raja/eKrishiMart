// import { NextRequest, NextResponse } from "next/server";
// import Warehouse from "@/models/warehouseModel";
// import Seller from "@/models/sellerModel";
// import Product from "@/models/productModel";
// import connect from "@/dbConfig/dbConfig";
// import { Types } from "mongoose";

// connect();

// export async function GET(req: NextRequest) {
//   try {
//     console.log("=========== STARTING REQUEST ===========");
//     const managerId = req.headers.get('x-user-id');
    
//     console.log("[1] Manager ID from headers:", managerId);
    
//     if (!managerId || !Types.ObjectId.isValid(managerId)) {
//       console.log("[ERROR] Invalid Manager ID format");
//       return NextResponse.json({ error: "Invalid Manager ID" }, { status: 401 });
//     }

//     // Debug: Log all warehouses with their managers
//     console.log("[2] Fetching all warehouses for debug...");
//     const allWarehouses = await Warehouse.find().select("manager serviceablePincodes").lean();
//     console.log("[2a] All warehouses in system:", JSON.stringify(allWarehouses, null, 2));

//     // Find the specific warehouse
//     console.log(`[3] Searching for warehouse with manager email: ${managerId}`);
//     const warehouse = await Warehouse.findOne({ 
//       "manager.email": managerId 
//     }).select("serviceablePincodes _id manager");

//     if (!warehouse) {
//       console.log(`[ERROR] No warehouse found for manager: ${managerId}`);
//       console.log("[3a] Available manager emails in system:", 
//         allWarehouses.map(w => w.manager?.email));
//       return NextResponse.json({ 
//         error: "Warehouse not found",
//         details: `Manager email: ${managerId}` 
//       }, { status: 404 });
//     }

//     console.log("[4] Found warehouse:", {
//       warehouseId: warehouse._id,
//       managerEmail: warehouse.manager?.email,
//       pincodes: warehouse.serviceablePincodes
//     });

//     // Find sellers in these pincodes
//     console.log(`[5] Searching sellers in pincodes: ${warehouse.serviceablePincodes}`);
//     const sellers = await Seller.find({
//       "businessAddress.pincode": { $in: warehouse.serviceablePincodes }
//     }).select("_id username businessAddress.pincode warehouseId");

//     console.log(`[5a] Found ${sellers.length} sellers in serviceable areas:`);
//     sellers.forEach((seller, index) => {
//       console.log(`  Seller ${index + 1}:`, {
//         sellerId: seller._id,
//         pincode: seller.businessAddress.pincode,
//         warehouseId: seller.warehouseId,
//         matchesWarehouse: seller.warehouseId?.equals(warehouse._id)
//       });
//     });

//     if (sellers.length === 0) {
//       console.log("[WARNING] No sellers found in serviceable areas");
//       return NextResponse.json({ 
//         data: [],
//         message: "No sellers found in serviceable areas" 
//       }, { status: 200 });
//     }

//     // Get all products from these sellers
//     console.log("[6] Fetching products for sellers...");
//     const sellerIds = sellers.map(seller => seller._id);
//     const products = await Product.find({ 
//       sellerId: { $in: sellerIds } 
//     }).select("name sku imageUrl itemQuantity category pricing expiryDate sellerId");

//     console.log(`[6a] Found ${products.length} products across all sellers`);

//     // Format the response
//     console.log("[7] Formatting response data...");
//     const response = sellers.map(seller => {
//       const sellerProducts = products
//         .filter(p => p.sellerId.toString() === seller._id.toString())
//         .map(p => ({
//           _id: p._id.toString(),
//           name: p.name,
//           sku: p.sku,
//           image: p.imageUrl || null,
//           quantity: p.itemQuantity,
//           category: p.category,
//           price: p.pricing.basePrice,
//           expiry: new Date(p.expiryDate).toISOString().split('T')[0]
//         }));

//       return {
//         sellerId: seller._id.toString(),
//         sellerName: seller.username,
//         businessName: seller.businessName,
//         contact: seller.contactNumber,
//         pincode: seller.businessAddress.pincode,
//         warehouseId: seller.warehouseId?.toString() || "",
//         products: sellerProducts
//       };
//     });

//     console.log("[8] Sending successful response");
//     console.log("=========== REQUEST COMPLETE ===========");
//     return NextResponse.json({ 
//       data: response,
//       message: "Products fetched successfully"
//     }, { status: 200 });

//   } catch (error: any) {
//     console.error("[FATAL ERROR] in GET /api/manager/sellerProducts:", error);
//     console.error("Error stack:", error.stack);
//     console.log("=========== REQUEST FAILED ===========");
//     return NextResponse.json(
//       { 
//         error: error.message || "Internal Server Error",
//         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       }, 
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import Warehouse from "@/models/warehouseModel";
import Seller from "@/models/sellerModel";
import Product from "@/models/productModel";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

export async function GET(req: NextRequest) {
  try {
    const managerEmail = req.headers.get('x-user-id');

    const tokenData = getDataFromToken(req);

        // 2. Access the userId and userEmail from the returned object
        const userId = tokenData.id;
        const userEmail = tokenData.email;

        console.log(`User ID from token: ${userId}, Email from token : ${userEmail} dekha na mazaaa`);
    
    // ✅ FIX: Check for a valid string, not an ObjectId
    if (!managerEmail) {
      return NextResponse.json({ error: "Manager Email not provided" }, { status: 401 });
    }

    // ✅ FIX: Query by email, which matches the check above and what the frontend sends
    const warehouse = await Warehouse.findOne({ 
      "manager.email": managerEmail 
    }).select("serviceablePincodes");

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found for this manager" }, { status: 404 });
    }

    const sellers = await Seller.find({
      "businessAddress.pincode": { $in: warehouse.serviceablePincodes }
    }).select("username businessName contactNumber businessAddress warehouseId");

    if (sellers.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const sellerIds = sellers.map(seller => seller._id);
    const products = await Product.find({ 
      sellerId: { $in: sellerIds } 
    }).select("name sku imageUrl itemQuantity category pricing expiryDate sellerId");

    const responseData = sellers.map(seller => ({
      sellerId: seller._id.toString(),
      businessName: seller.businessName,
      contact: seller.contactNumber,
      pincode: seller.businessAddress.pincode,
      warehouseId: seller.warehouseId?.toString() || null,
      products: products
        .filter(p => p.sellerId.toString() === seller._id.toString())
        .map(p => ({
          _id: p._id.toString(),
          name: p.name,
          sku: p.sku,
          image: p.imageUrl || null,
          quantity: p.itemQuantity,
          category: p.category,
          price: p.pricing.basePrice,
          expiry: new Date(p.expiryDate).toISOString().split('T')[0]
        }))
    }));

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/manager/sellerProducts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}