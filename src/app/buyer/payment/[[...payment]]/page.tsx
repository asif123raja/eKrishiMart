// app/checkout/[[...payment]]/page.tsx
"use client";
import { redirect } from 'next/navigation';

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  // Handle payment status
  if (searchParams.payment === 'failed') {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <h2>Payment Failed</h2>
        <p>Your payment could not be processed. Please try again.</p>
        <button onClick={() => window.location.href = '/checkout'}>
          Retry Payment
        </button>
      </div>
    );
  }

  // Your normal checkout page content
  return <div>Checkout Form</div>;
}