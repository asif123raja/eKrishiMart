'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Define a type for the order data for better TypeScript support
interface OrderData {
  _id: string;
  products: Array<{
    name: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
  orderTotal: {
    subtotal: number;
    platformFee: number;
    inventoryFee: number;
    deliveryCharge: number;
    gstOnFees: number;
    grandTotal: number;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryPasscode: string;
  createdAt: string;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/buyer/orders/${orderId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch order details.');
        }

        setOrder(data.order);
      } catch (err: unknown) {
        if (err instanceof Error) {
            toast.error(err.message);
        } else {
            toast.error("An unknown error occurred.");
        }
        router.push('/'); // Redirect home if order not found or error
    } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  if (loading) {
    return <p className="text-center p-8">Loading your order details...</p>;
  }

  if (!order) {
    return <p className="text-center p-8 text-red-500">Could not find your order.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-3xl font-bold mt-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase. Here are your order details.</p>
          <p className="text-sm text-gray-500 mt-1">Order ID: {order._id}</p>
        </div>

        {/* Delivery Passcode Section */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md my-6">
            <h2 className="font-bold text-lg">Important: Your Delivery Passcode</h2>
            <p>Please provide this 6-digit passcode to the delivery agent to receive your order.</p>
            <p className="text-3xl font-bold tracking-widest my-2 bg-white p-2 rounded text-center">{order.deliveryPasscode}</p>
        </div>

        {/* Order Details */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.orderTotal.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Fees & Charges</span><span>₹{(order.orderTotal.platformFee + order.orderTotal.inventoryFee + order.orderTotal.deliveryCharge).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>GST on Fees</span><span>₹{order.orderTotal.gstOnFees.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Grand Total</span><span>₹{order.orderTotal.grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Items Ordered</h2>
            {order.products.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
            <Link href="/" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                Continue Shopping
            </Link>
            <Link href="/buyer/orderHistory" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
                View My Orders
            </Link>
        </div>
      </div>
    </div>
  );
}