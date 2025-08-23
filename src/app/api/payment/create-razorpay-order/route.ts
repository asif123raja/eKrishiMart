import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', buyerId } = await request.json();

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

  } catch (err: any) {
    console.error('Payment Error:', {
      error: err.error?.description || err.message,
      code: err.error?.code,
      status: err.statusCode
    });

    return NextResponse.json(
      {
        error: err.error?.description || 'Payment processing failed',
        code: err.error?.code || 'UNKNOWN_ERROR'
      },
      { status: err.statusCode || 500 }
    );
  }
}