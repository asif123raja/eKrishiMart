import { NextRequest, NextResponse } from "next/server";
import Warehouse from "@/models/warehouseModel";
import Seller from "@/models/sellerModel";
import Product from "@/models/productModel";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";


export async function GET(req: NextRequest) {
  try {
    await connect();
    const managerEmail = req.headers.get('x-user-id');

    const tokenData = getDataFromToken(req);
    if( !tokenData || !tokenData.id){
              return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
            }

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