'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Define a type for the order data
interface Order {
  _id: string;
  orderStatus: string;
  createdAt: string;
  orderTotal: {
    grandTotal: number;
  };
  products: Array<{
    _id: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
    productId: { // This will be populated
        imageUrl: string | null;
    }
  }>;
}

// Helper to get a color for the order status
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'shipped': return 'bg-blue-100 text-blue-800';
        case 'processing': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}


export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/buyer/orderhis'); // The API knows the user from the token
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch orders.');
        }

        setOrders(data.orders);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center p-8">Loading your order history...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Order History</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p>You have not placed any orders yet.</p>
            <Link href="/" className="mt-4 inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-4">
                  <div>
                    <p className="font-semibold">Order ID: <span className="font-normal text-gray-600">{order._id}</span></p>
                    <p className="text-sm text-gray-500">
                      Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                     <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                     </span>
                     <p className="text-xl font-bold">₹{order.orderTotal.grandTotal.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Product List */}
                <div className="space-y-4">
                    {order.products.map(product => (
                        <div key={product._id} className="flex items-center gap-4">
                            <img 
                                src={product.productId?.imageUrl || '/images/placeholder.png'} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                                <p className="text-sm text-gray-600">Price: ₹{product.priceAtPurchase.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-right mt-4">
                    <Link href={`/buyer/orders/${order._id}`} className="font-semibold text-green-600 hover:text-green-800">
                       View Details →
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}