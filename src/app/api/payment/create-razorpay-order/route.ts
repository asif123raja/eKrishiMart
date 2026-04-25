import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getDataFromToken } from "@/helper/getDataFromToken";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export async function POST(request: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_SECRET_ID!,
    });

    const tokenData = await getDataFromToken(request);
        if( !tokenData || !tokenData.id){
                  return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
                }
    
            // 2. Access the userId and userEmail from the returned object
            const buyerId = tokenData.id;
    const { amount, currency = 'INR', } = await request.json();

    // Validate inputs
    if (!amount || isNaN(Number(amount))) {
      throw new Error('Invalid amount provided');
    }
    if (Number(amount) < 100) {
      throw new Error('Amount must be at least ₹1 (100 paise)');
    }

    // Create shorter receipt ID (max 40 chars)
    const shortBuyerId = buyerId.slice(0, 8); // Take first 8 chars of buyerId
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const receipt = `ord_${shortBuyerId}_${timestamp}`; // Total: 8 + 6 + 6 = 20 chars

    const options = {
      amount: Math.round(Number(amount)),
      currency,
      receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options) as RazorpayOrder;

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error: unknown) {
    // First, check for the specific, nested error structure from the payment API
    if (
        error &&
        typeof error === 'object' &&
        'error' in error && 
        error.error && 
        typeof error.error === 'object'
    ) {
        // Assert the type now that we've confirmed its shape
        const apiError = error as {
            statusCode?: number;
            message?: string;
            error: {
                description?: string;
                code?: string;
            }
        };

        const errorMessage = apiError.error.description || apiError.message || 'Payment processing failed';
        const errorCode = apiError.error.code || 'UNKNOWN_ERROR';
        const statusCode = apiError.statusCode || 500;
        
        console.error('Payment Error:', {
            error: errorMessage,
            code: errorCode,
            status: statusCode
        });

        return NextResponse.json(
            { error: errorMessage, code: errorCode },
            { status: statusCode }
        );
    }
    
    // Fallback for standard JavaScript errors
    if (error instanceof Error) {
        console.error('Payment Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    // Fallback for any other type of exception
    return NextResponse.json(
        { error: 'An unknown error occurred during payment processing' },
        { status: 500 }
    );
}
}