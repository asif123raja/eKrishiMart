import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connect from '@/dbConfig/dbConfig';
import PendingProduct from '@/models/pendingProductModel';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    console.log('🔐 Payment verification endpoint hit');
    
    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        await connect();
        console.log('✅ Database connected');

        // --- ✅ AUTHENTICATION USING SAME METHOD AS PRODUCT UPLOAD ROUTE ---
        console.log('🔑 Starting authentication check...');
        const cookieStore = await cookies();
        console.log("✅ Cookies fetched");

        const token = cookieStore.get('token')?.value;
        console.log("🔑 Token present:", !!token);

        if (!token) {
            console.log("❌ No token found");
            return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
        }

        let sellerId: string;
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
            sellerId = decoded.id;
            console.log("✅ Token verified. Seller ID:", sellerId);
        } catch (err) {
            console.log("❌ Token verification failed:", err);
            return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }

        // --- If we get here, authentication was successful. Proceed with payment verification. ---
        console.log('📦 Parsing request body...');
        const requestBody = await request.json();
        console.log('📋 Request body received');

        const { paymentDetails, pendingProductId } = requestBody;
        
        if (!paymentDetails || !pendingProductId) {
            console.error('❌ Missing required fields in request body');
            return NextResponse.json({ 
                error: "Missing paymentDetails or pendingProductId" 
            }, { status: 400 });
        }
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('❌ Missing Razorpay payment details');
            return NextResponse.json({ 
                error: "Missing Razorpay payment details" 
            }, { status: 400 });
        }
        
        console.log('💰 Payment details received:');
        console.log('   Order ID:', razorpay_order_id);
        console.log('   Payment ID:', razorpay_payment_id);
        console.log('   Signature:', razorpay_signature.substring(0, 20) + '...');
        
        // Verify Razorpay signature
        console.log('🔏 Verifying payment signature...');
        
        // Use the same environment variable naming as your product route
        const razorpayKeySecret = process.env.RAZORPAY_SECRET_ID || process.env.RAZORPAY_KEY_SECRET;
        if (!razorpayKeySecret) {
            console.error('❌ Razorpay secret not configured');
            return NextResponse.json({ error: "Payment system configuration error" }, { status: 500 });
        }
        
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        
        console.log('   Expected signature:', expectedSignature.substring(0, 20) + '...');
        console.log('   Received signature:', razorpay_signature.substring(0, 20) + '...');
        
        if (expectedSignature !== razorpay_signature) {
            console.error('❌ Signature verification failed!');
            console.error('   Expected:', expectedSignature);
            console.error('   Received:', razorpay_signature);
            throw new Error('Invalid payment signature. Transaction compromised.');
        }
        
        console.log('✅ Signature verification successful');
        
        // Find the pending product
        console.log('🔍 Looking for pending product:', pendingProductId);
        const productToUpdate = await PendingProduct.findOne({
            _id: pendingProductId,
            sellerId: sellerId,
            status: 'awaiting-payment'
        });
        
        if (!productToUpdate) {
            console.error('❌ No pending product found with criteria:', {
                pendingProductId,
                sellerId,
                status: 'awaiting-payment'
            });
            
            // Check if product exists but with different status
            const productWithDifferentStatus = await PendingProduct.findOne({
                _id: pendingProductId,
                sellerId: sellerId
            });
            
            if (productWithDifferentStatus) {
                console.error('ℹ️ Product found but with status:', productWithDifferentStatus.status);
            } else {
                console.error('ℹ️ No product found with that ID and seller ID');
            }
            
            throw new Error("No pending product found for this payment, or it may have expired.");
        }
        
        console.log('✅ Pending product found:', productToUpdate.name);
        
        // Update the product status
        console.log('🔄 Updating product status...');
        productToUpdate.status = 'pending'; 
        productToUpdate.deliveryPaymentStatus = 'paid';
        productToUpdate.deliveryTransactionId = razorpay_payment_id;
        productToUpdate.expiresAt = undefined;
        
        await productToUpdate.save();
        console.log('✅ Product updated successfully');
        
        return NextResponse.json({
            success: true,
            message: "Payment verified and product submitted for approval!",
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