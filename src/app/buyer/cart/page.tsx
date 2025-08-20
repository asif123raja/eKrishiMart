// 'use client';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState, useMemo } from 'react';
// import toast from 'react-hot-toast';

// // ✅ Define constants for fees and rules for easy management
// const PLATFORM_FEE = 3;
// const INVENTORY_FEE = 5;
// const GST_RATE = 0.18; // 18%
// const MINIMUM_ORDER_VALUE = 200;

// export default function CartPage() {
//   const [cart, setCart] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router= useRouter();
//   const buyerId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

//   useEffect(() => {
//     if (!buyerId) {
//         setLoading(false); // No user, so stop loading
//         return;
//     };
//     fetch(`/api/buyer/cart?buyerId=${buyerId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.cart) setCart(data.cart);
//       })
//       .catch(err => toast.error("Failed to fetch cart"))
//       .finally(() => setLoading(false));
//   }, [buyerId]);

//   const handleRemove = async (productId: string) => {
//     const res = await fetch('/api/buyer/cart', {
//       method: 'DELETE',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ buyerId, productId }),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       toast.success("Item removed");
//       setCart(prev => prev.filter(item => item.productId._id !== productId));
//     } else {
//       toast.error(data.error || "Error removing item");
//     }
//   };

//   const getPriceForQuantity = (item: any): number => {
//     const { quantity, productId } = item;
//     if (!productId || !productId.pricing) return 0; // Safety check
    
//     const { pricing } = productId;
//     // Start with base price or discounted price if available
//     let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

//     // Override with bulk price if a better tier is met
//     if (pricing.bulkPricing && Array.isArray(pricing.bulkPricing)) {
//       // Sort tiers from highest minQuantity to lowest to find the best applicable price
//       const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
//       for (const bulk of sortedTiers) {
//         if (quantity >= bulk.minQuantity) {
//           applicablePrice = bulk.price;
//           break; // Found the best tier, no need to check further
//         }
//       }
//     }
//     return applicablePrice;
//   };

//   // ✅ Use useMemo for efficient calculation. It only recalculates when the cart changes.
//   const totals = useMemo(() => {
//     const subtotal = cart.reduce((total, item) => {
//       const price = getPriceForQuantity(item);
//       return total + price * item.quantity;
//     }, 0);

//     const isEligibleForCheckout = subtotal >= MINIMUM_ORDER_VALUE;

//     let deliveryCharge = 0;
//     if (isEligibleForCheckout) {
//         if (subtotal <= 400) deliveryCharge = 40;
//         else if (subtotal <= 800) deliveryCharge = 60;
//         else if (subtotal <= 1000) deliveryCharge = 70;
//         else if (subtotal <= 5000) deliveryCharge = 100;
//         else if (subtotal <= 20000) deliveryCharge = 150;
//         else deliveryCharge = 300;
//     }

//     const totalFees = PLATFORM_FEE + INVENTORY_FEE + deliveryCharge;
//     const gstOnFees = totalFees * GST_RATE;
//     const grandTotal = subtotal + totalFees + gstOnFees;

//     return {
//       subtotal,
//       platformFee: PLATFORM_FEE,
//       inventoryFee: INVENTORY_FEE,
//       deliveryCharge,
//       gstOnFees,
//       grandTotal,
//       isEligibleForCheckout
//     };
//   }, [cart]);

//   const handleCheckout = () => {
//     if (!totals.isEligibleForCheckout) return;
//     toast.success(`Proceeding to checkout with a total of ₹${totals.grandTotal.toFixed(2)}`);
//     router.push('/buyer/checkout');
//   };

//   if (loading) return <p className="p-4">Loading cart...</p>;
//   if (!cart.length) return <p className="p-4">Your cart is empty.</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
//       {cart.map((item, idx) => {
//         const price = getPriceForQuantity(item);
//         return (
//           <div key={idx} className="flex justify-between items-center border p-3 mb-3 rounded shadow-sm bg-white">
//             <div>
//                 <h2 className="text-lg font-bold">{item.productId.name}</h2>
//                 <p>Quantity: {item.quantity}</p>
//                 <p>Price: ₹{price.toFixed(2)} each</p>
//                 <button
//                     onClick={() => handleRemove(item.productId._id)}
//                     className="mt-2 text-red-500 text-sm hover:underline"
//                 >
//                     Remove
//                 </button>
//             </div>
//             <div className="text-right font-semibold">
//                 <p>₹{(price * item.quantity).toFixed(2)}</p>
//             </div>
//           </div>
//         );
//       })}
      
//       {/* ✅ NEW: Detailed order summary section */}
//       <div className="mt-6 p-4 border rounded shadow-sm bg-white">
//         <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
//         <div className="space-y-2">
//             <div className="flex justify-between">
//                 <span>Subtotal (Products)</span>
//                 <span>₹{totals.subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span>Platform Fee</span>
//                 <span>₹{totals.platformFee.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span>Inventory Fee</span>
//                 <span>₹{totals.inventoryFee.toFixed(2)}</span>
//             </div>
//              <div className="flex justify-between">
//                 <span>Delivery Charge</span>
//                 <span>₹{totals.deliveryCharge.toFixed(2)}</span>
//             </div>
//              <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
//                 <span>GST (18% on fees & services)</span>
//                 <span>₹{totals.gstOnFees.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-xl font-bold pt-2">
//                 <span>Grand Total</span>
//                 <span>₹{totals.grandTotal.toFixed(2)}</span>
//             </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <button
//           onClick={handleCheckout}
//           // ✅ NEW: Disable button if subtotal is below the minimum
//           disabled={!totals.isEligibleForCheckout}
//           className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           Proceed to Checkout
//         </button>
//         {/* ✅ NEW: Show message if checkout is not allowed */}
//         {!totals.isEligibleForCheckout && (
//             <p className="text-center text-red-600 mt-2">
//                 A minimum order value of ₹{MINIMUM_ORDER_VALUE} is required to checkout.
//             </p>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ✅ Only the minimum order value is needed here now
const MINIMUM_ORDER_VALUE = 200;

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const buyerId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

  useEffect(() => {
    if (!buyerId) {
        setLoading(false);
        return;
    };
    fetch(`/api/buyer/cart?buyerId=${buyerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.cart) setCart(data.cart);
      })
      .catch(err => toast.error("Failed to fetch cart"))
      .finally(() => setLoading(false));
  }, [buyerId]);

  const handleRemove = async (productId: string) => {
    const res = await fetch('/api/buyer/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId, productId }),
    });

    if (res.ok) {
      toast.success("Item removed");
      setCart(prev => prev.filter(item => item.productId._id !== productId));
    } else {
      const data = await res.json();
      toast.error(data.error || "Error removing item");
    }
  };

    const getPriceForQuantity = (item: any): number => {
    const { quantity, productId } = item;
    if (!productId || !productId.pricing) return 0; // Safety check
    
    const { pricing } = productId;
    // Start with base price or discounted price if available
    let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

    // Override with bulk price if a better tier is met
    if (pricing.bulkPricing && Array.isArray(pricing.bulkPricing)) {
      // Sort tiers from highest minQuantity to lowest to find the best applicable price
      const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const bulk of sortedTiers) {
        if (quantity >= bulk.minQuantity) {
          applicablePrice = bulk.price;
          break; // Found the best tier, no need to check further
        }
      }
    }
    return applicablePrice;
  };

  // ✅ SIMPLIFIED: The calculation now only computes the product subtotal
  const totals = useMemo(() => {
    const subtotal = cart.reduce((total, item) => {
      const price = getPriceForQuantity(item);
      return total + price * item.quantity;
    }, 0);

    const isEligibleForCheckout = subtotal >= MINIMUM_ORDER_VALUE;

    return {
      subtotal,
      isEligibleForCheckout
    };
  }, [cart]);

  const handleCheckout = () => {
    if (!totals.isEligibleForCheckout) return;
    router.push('/buyer/checkout');
  };

  if (loading) return <p className="p-4">Loading cart...</p>;
  if (!cart.length) return <p className="p-4">Your cart is empty.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {cart.map((item, idx) => {
        const price = getPriceForQuantity(item);
        return (
          <div key={idx} className="flex justify-between items-center border p-3 mb-3 rounded shadow-sm bg-white">
            <div>
                <h2 className="text-lg font-bold">{item.productId.name}</h2>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ₹{price.toFixed(2)} each</p>
                <button
                    onClick={() => handleRemove(item.productId._id)}
                    className="mt-2 text-red-500 text-sm hover:underline"
                >
                    Remove
                </button>
            </div>
            <div className="text-right font-semibold">
                <p>₹{(price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        );
      })}
      
      {/* ✅ SIMPLIFIED: The summary now only shows the subtotal */}
      <div className="mt-6 p-4 border rounded shadow-sm bg-white">
        <div className="flex justify-between text-xl font-bold">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleCheckout}
          disabled={!totals.isEligibleForCheckout}
          className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
        {!totals.isEligibleForCheckout && (
            <p className="text-center text-red-600 mt-2">
                A minimum order value of ₹{MINIMUM_ORDER_VALUE} is required to checkout.
            </p>
        )}
      </div>
    </div>
  );
}