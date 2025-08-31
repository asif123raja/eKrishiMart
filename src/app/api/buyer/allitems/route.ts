import { NextRequest, NextResponse } from "next/server";
import Buyer from "@/models/userModel";
import Warehouse from "@/models/warehouseModel";
import Seller from "@/models/sellerModel";
import Product from "@/models/productModel";
import connect from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helper/getDataFromToken";



// ✅ Define a type for the populated seller data for better TypeScript support
interface PopulatedSeller {
  _id: string;
  username: string;
  sku: string;
  businessAddress: {
    pincode: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    await connect();
    const tokenData = getDataFromToken(req);
    if( !tokenData || !tokenData.id){
       return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }
    const userId = tokenData.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find buyer and their pincode
    const buyer = await Buyer.findById(userId).select("pincode");
    const buyerPincode = buyer?.pincode;

    if (!buyerPincode) {
      return NextResponse.json({ error: "Buyer or pincode not found" }, { status: 404 });
    }
    
    // 2. Find the warehouse that serves this pincode
    const warehouse = await Warehouse.findOne({ serviceablePincodes: buyerPincode });
    if (!warehouse) {
      return NextResponse.json({ error: "Service is not available in your area" }, { status: 404 });
    }

    // 3. Find sellers assigned to this warehouse (we only need their IDs)
    const sellers = await Seller.find({
      warehouseId: warehouse._id, 
    }).select("_id");

    if (sellers.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const sellerIds = sellers.map((s) => s._id);

    // 4. Find all products sold by those sellers
    // ✅ FIXED: Populate all the required seller fields in one go
    const products = await Product.find({
      sellerId: { $in: sellerIds },
    }).populate({
        path: 'sellerId',
        model: Seller,
        select: 'username sku businessAddress.pincode'
    });

    // 5. Map the final product data
    const productsWithSellerInfo = products.map((product) => {
        const sellerInfo = product.sellerId as PopulatedSeller;

        return {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            imageUrl: product.imageUrl,
            itemQuantity: product.itemQuantity,
            description: product.description,
            category: product.category,
            variety: product.variety,
            nutrition: product.nutrition,
            minerals: product.minerals,
            pricing: product.pricing,
            // ✅ FIXED: Construct the seller object with all required fields
            seller: {
                _id: sellerInfo?._id,
                username: sellerInfo?.username,
                pincode: sellerInfo?.businessAddress?.pincode,
                sku: sellerInfo?.sku,
            },
        };
    });

    return NextResponse.json({ products: productsWithSellerInfo });

  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}