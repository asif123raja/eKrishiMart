// /app/api/buyer/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";



// GET – fetch wishlist items
export async function GET(req: NextRequest) {
  try {
    await connect();
    const tokenData = await getDataFromToken(req);
        if( !tokenData || !tokenData.id){
          return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
        }
        const buyerId = tokenData.id;

    const buyer = await Buyer.findById(buyerId).populate("wishlist.productId");
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: buyer.wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE – remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const { buyerId, productId } = await req.json();
    if (!buyerId || !productId) {
      return NextResponse.json({ error: "Missing buyerId or productId" }, { status: 400 });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    buyer.wishlist = buyer.wishlist.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await buyer.save();

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}
