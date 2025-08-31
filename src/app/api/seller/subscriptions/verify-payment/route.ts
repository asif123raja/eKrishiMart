import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
// ✅ 1. Use the same helper function for consistency
import { getDataFromToken } from '@/helper/getDataFromToken';

export async function POST(request: NextRequest) {
    console.log('🔐 Subscription Payment verification endpoint hit');
    
    try {
        await connect();
        console.log('✅ Database connected');

        // --- AUTHENTICATION (Now consistent with your other route) ---
        console.log('🔑 Starting authentication check...');
        let sellerId: string;
        try {
            const tokenData = getDataFromToken(request);
            const userId = tokenData?.id;
            if (!userId) throw new Error("Token is missing user ID");
            sellerId = userId;
            console.log("✅ Token verified. Seller ID:", sellerId);
        } catch (err: any) {
            console.log("❌ Token verification failed:", err);
            return NextResponse.json({ error: "Unauthorized: " + err.message }, { status: 401 });
        }

        // --- PAYMENT VERIFICATION ---
        console.log('📦 Parsing request body...');
        const { paymentDetails, targetPlan } = await request.json();
        
        if (!paymentDetails || !targetPlan) {
            return NextResponse.json({ error: "Missing paymentDetails or targetPlan" }, { status: 400 });
        }
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
        
        console.log(`💰 Payment details received for plan: ${targetPlan}`);
        console.log('🔏 Verifying payment signature...');

        // ✅ 2. Use the SAME environment variable name as your create-order route
        const razorpayKeySecret = process.env.RAZORPAY_SECRET_ID; 
        if (!razorpayKeySecret) {
            throw new Error("Razorpay secret not configured on the server.");
        }
        
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        
        if (expectedSignature !== razorpay_signature) {
            throw new Error('Invalid payment signature. Transaction compromised.');
        }
        
        console.log('✅ Signature verification successful');
        
        // --- UPDATE SELLER SUBSCRIPTION ---
        console.log('🔍 Finding seller to update subscription:', sellerId);
        const sellerToUpdate = await Seller.findById(sellerId);
        
        if (!sellerToUpdate) {
            throw new Error("Seller associated with this token not found.");
        }
        
        console.log(`✅ Seller found. Current plan: ${sellerToUpdate.subscriptionPlan}. Upgrading to: ${targetPlan}`);
        
        sellerToUpdate.subscriptionPlan = targetPlan;
        
        await sellerToUpdate.save();
        console.log('✅ Seller subscription updated successfully');
        
        return NextResponse.json({
            success: true,
            message: `Successfully upgraded to the ${targetPlan} plan!`,
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