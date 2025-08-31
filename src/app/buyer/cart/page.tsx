'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


// ✅ 1. Define a clear type for the cart item data
interface CartItem {
  _id: string;
  quantity: number;
  productId: {
    _id: string;
    name: string;
    pricing: {
      basePrice: number;
      discountedPrice?: number;
      bulkPricing?: {
        minQuantity: number;
        price: number;
      }[];
    };
  };
}
// ✅ Only the minimum order value is needed here now
const MINIMUM_ORDER_VALUE = 200;

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/buyer/cart', {
        credentials: 'include' // ✅ Send cookies automatically
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.cart) setCart(data.cart);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to fetch cart: " + error.message);
      } else {
        toast.error("An unknown error occurred while fetching the cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch('/api/buyer/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Send cookies
        body: JSON.stringify({ productId }), // ✅ REMOVED buyerId
      });

      if (res.ok) {
        toast.success("Item removed");
        setCart(prev => prev.filter(item => item.productId._id !== productId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Error removing item");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Failed to remove item");
    }
  };

  const getPriceForQuantity = (item: CartItem): number => {
    const { quantity, productId } = item;
    if (!productId?.pricing) return 0;
    
    const { pricing } = productId;
    let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

    if (pricing.bulkPricing?.length) {
      const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const bulk of sortedTiers) {
        if (quantity >= bulk.minQuantity) {
          applicablePrice = bulk.price;
          break;
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