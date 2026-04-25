import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig";
import Razorpay from 'razorpay'; 






const priceMap: { [key: string]: { [key: string]: number } } = {
    basic: { pro: 1000, enterprise: 3000 },
    pro: { enterprise: 2300 }
};

export async function POST(request: NextRequest) {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
            return NextResponse.json({ error: "Missing Razorpay config" }, { status: 500 });
        }
        
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_ID,
        });

        await connect();
        const token =await getDataFromToken(request);
        if (!token || !token.id) {
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }
        const sellerId = token.id;
        
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return NextResponse.json({ error: "Seller not found" }, { status: 404 });
        }

        const { targetPlan } = await request.json();
        const currentPlan = seller.subscriptionPlan;

        if (!priceMap[currentPlan] || !priceMap[currentPlan][targetPlan]) {
            return NextResponse.json({ error: "Invalid upgrade path or plan." }, { status: 400 });
        }
        
        const amount = priceMap[currentPlan][targetPlan];
        
        // ✅ 2. Use the new, correct type for your 'options' object.
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `sub_${seller._id.toString()}_${targetPlan}`,
            notes: { 
                paymentType: 'subscription',
                sellerId: seller._id.toString(), 
                targetPlan: targetPlan,
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order: order,
        });

    } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}
