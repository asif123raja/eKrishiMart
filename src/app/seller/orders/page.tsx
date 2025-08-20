'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Define TypeScript interfaces for type safety
interface Buyer {
    _id: string;
    username: string;
    email: string;
}

interface ProductInOrder {
    productId: string;
    sellerId: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
}

interface Order {
    _id:string;
    buyerId: Buyer;
    products: ProductInOrder[];
    orderTotal: {
        grandTotal: number;
    };
    shippingAddress: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        // In a real app, you'd get the seller's ID from your auth context
        // For now, we can fetch it or assume it's available.
        // The API route will derive it from the token anyway.
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/seller/orders');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                
                // The API might return a message instead of an orders array
                setOrders(data.orders || []);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (loading) {
        return <div className="text-center p-10">Loading your orders...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Product Orders</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-lg shadow">
                        <p className="text-gray-500">You have no orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 sm:flex sm:justify-between sm:items-center">
                                    <div>
                                        <p className="text-sm font-medium text-indigo-600">Order ID: {order._id}</p>
                                        <p className="text-sm text-gray-500">
                                            Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold rounded-full inline-block ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </div>
                                </div>
                                
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Column 1: Your Products in this Order */}
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold text-gray-800 mb-2">Your Items in this Order</h3>
                                        <div className="space-y-2">
                                            {order.products.map((product) => (
                                                <div key={product.productId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium text-gray-700">{product.name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-gray-800">
                                                        ₹{(product.priceAtPurchase * product.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Column 2: Shipping & Buyer Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Buyer</h3>
                                            <p className="text-sm text-gray-600">{order.buyerId.username}</p>
                                            <p className="text-sm text-gray-500">{order.buyerId.email}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                                            <address className="text-sm text-gray-600 not-italic">
                                                {order.shippingAddress.addressLine1}<br />
                                                {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                            </address>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}