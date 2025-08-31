// app/api/buyer/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Buyer from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

// connect();

// -------------------------------
// GET CART ITEMS
// -------------------------------
export async function GET(req: NextRequest) {
  try {
    await connect();
    const tokenData = getDataFromToken(req);
        if( !tokenData || !tokenData.id){
           return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
        }
    const buyerId= tokenData.id;
    if (!buyerId) {
      return NextResponse.json({ error: 'Missing buyerId' }, { status: 400 });
    }

    const buyer = await Buyer.findById(buyerId).populate('cart.productId');
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json({ cart: buyer.cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// -------------------------------
// REMOVE FROM CART
// -------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { buyerId, productId } = await req.json();

    if (!buyerId || !productId) {
      return NextResponse.json({ error: 'Missing buyerId or productId' }, { status: 400 });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Remove item from cart
    buyer.cart = buyer.cart.filter(
      (item: any) => item.productId.toString() !== productId
    );
    await buyer.save();

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error: unknown) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
  }
}
