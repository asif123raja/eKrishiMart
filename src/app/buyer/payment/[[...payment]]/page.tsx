// // app/checkout/[[...payment]]/page.tsx
// "use client";
// export default function CheckoutPage({
//   searchParams,
// }: {
//   searchParams: { payment?: string };
// }) {
//   // Handle payment status
//   if (searchParams.payment === 'failed') {
//     return (
//       <div className="p-4 bg-red-100 text-red-800 rounded-lg">
//         <h2>Payment Failed</h2>
//         <p>Your payment could not be processed. Please try again.</p>
//         <button onClick={() => window.location.href = '/checkout'}>
//           Retry Payment
//         </button>
//       </div>
//     );
//   }

//   // Your normal checkout page content
//   return <div>Checkout Form</div>;
// }
// app/checkout/[[...payment]]/page.tsx
"use client";
import { useEffect, useState } from 'react';

interface PaymentParams {
  payment?: string;
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<PaymentParams>;
}) {
  const [params, setParams] = useState<PaymentParams>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await searchParams;
        setParams(resolvedParams);
      } catch (error) {
        console.error('Error resolving searchParams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getParams();
  }, [searchParams]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle payment status
  if (params.payment === 'failed') {
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