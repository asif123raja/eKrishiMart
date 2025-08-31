'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// You can reuse the same Order interface
interface SellerDetails {
    _id: string;
    businessName: string;
    contactNumber: string;
    paymentDetails: {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        upiId: string;
    }
}

interface ProductInOrder {
    _id: string;
    name: string;
    quantity: number;
    warehouseId: string;
    sellerId: SellerDetails;
}

interface Order {
  _id: string;
  orderStatus: string;
  createdAt: string;
  buyerId: { username: string };
  shippingAddress: {
      addressLine1: string; city: string; state: string; pincode: string;
  };
  products: ProductInOrder[];
  // ✅ FIX: Added the missing property to match the data from your API
  orderTotal: { grandTotal: number };
}

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const res = await fetch('/api/manager/orders/completed');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrders(data.orders);
      } catch (err: unknown) {
        if (err instanceof Error) {
            toast.error(err.message || "Failed to fetch completed orders.");
        } else {
            toast.error("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedOrders();
  }, []);

  if (loading) return <p className="text-center p-8">Loading completed orders...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Completed Order History</h1>
            <Link href="/manager/orders" className="text-blue-600 hover:underline">
                ← Back to Active Orders
            </Link>
        </div>
        {orders.length === 0 ? (
          <p>No completed orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow-sm">
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-sm text-gray-600">Order ID: {order._id}</p>
                        <p className="text-sm text-gray-500">
                            Completed on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                     <p className="font-bold">₹{order.orderTotal.grandTotal.toFixed(2)}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}