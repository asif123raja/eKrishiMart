import { NextRequest, NextResponse } from "next/server";
import connect from "@/dbConfig/dbConfig";
import Buyer from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";



export async function GET(request: NextRequest) {
  try {
    await connect();
    // Get the buyerId from the URL query parameters
    const tokenData = getDataFromToken(request);
    if( !tokenData || !tokenData.id){
      return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }        
    const buyerId= tokenData.id;

    // Find the buyer and populate the product details within their cart
    const buyer = await Buyer.findById(buyerId).populate({
      path: 'cart.productId',
      model: 'Product', // Ensure your Product model is named 'Product'
      select: 'name pricing imageUrl bulkPricing' // Select only the fields you need
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json({ cart: buyer.cart });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// You can also add your DELETE handler to this same file
export async function DELETE(request: NextRequest) {
    try {
        await connect();
    // Get the buyerId from the URL query parameters
    const tokenData = getDataFromToken(request);
    if( !tokenData || !tokenData.id){
      return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }        
    const buyerId= tokenData.id;
        const { productId } = await request.json();
        if (!buyerId || !productId) {
            return NextResponse.json({ error: "Missing buyerId or productId" }, { status: 400 });
        }

        // Find the buyer and pull the item from their cart array
        const updatedBuyer = await Buyer.findByIdAndUpdate(
            buyerId,
            { $pull: { cart: { productId: productId } } },
            { new: true } // Return the updated document
        );

        if (!updatedBuyer) {
            return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Item removed from cart" });
        
    } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}