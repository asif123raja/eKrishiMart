'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ✅ Interfaces to define the shape of the data from your API
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
}

// ✅ Helper function to style the status badges
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'shipped':
        case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
        case 'processing': return 'bg-yellow-100 text-yellow-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [passcode, setPasscode] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // ✅ Fetches active orders from your API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manager/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders.");
      setOrders(data.orders);
    } catch (error: unknown) {
      if (error instanceof Error) {
          toast.error(error.message);
      } else {
          toast.error("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Handles status changes from the dropdown
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
        const res = await fetch(`/api/manager/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_status', payload: { newStatus } }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the list to show the change
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }
    }
  };

  // ✅ Handles completing an order with the passcode
  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !passcode) return;
    try {
        const res = await fetch(`/api/manager/orders/${selectedOrder._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete_order', payload: { passcode } }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        toast.success(`Order marked as delivered!`);
        setIsModalOpen(false);
        setPasscode('');
        fetchOrders(); // Refresh the list (completed order will disappear)
    } catch(error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }
    }
  };

  // ✅ Opens the passcode modal
  const openCompletionModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const groupProductsBySeller = (products: ProductInOrder[]) => {
      const sellers = new Map<string, { details: SellerDetails, products: ProductInOrder[] }>();
      products.forEach(p => {
          if (p.sellerId && !sellers.has(p.sellerId._id)) {
              sellers.set(p.sellerId._id, { details: p.sellerId, products: [] });
          }
          if(p.sellerId) sellers.get(p.sellerId._id)!.products.push(p);
      });
      return Array.from(sellers.values());
  };

  if (loading) return <p className="text-center p-8">Loading active orders...</p>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Active Order Management</h1>
            <Link href="/manager/orders/completed" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700">
                View Completed Orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p>No active orders for your warehouse.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Order ID: <span className="font-mono">{order._id}</span></p>
                      <p>Buyer: {order.buyerId?.username || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <hr className="my-4"/>
                  <div>
                    <h3 className="font-semibold mb-2">Products in this Order:</h3>
                    {order.products.map(p => (
                        <p key={p._id} className="text-sm text-gray-700">{p.quantity} x {p.name}</p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                      <select onChange={(e) => handleStatusUpdate(order._id, e.target.value)} value={order.orderStatus} className="p-2 border rounded text-sm">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="rejected">Reject</option>
                      </select>
                      <button onClick={() => openCompletionModal(order)} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700">
                          Complete with Passcode
                      </button>
                  </div>
                  <div className="mt-4 border-t pt-4">
                    <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                        className="text-blue-600 hover:underline font-semibold text-sm"
                    >
                        {expandedOrderId === order._id ? 'Hide Details' : 'Show Full Details'}
                    </button>
                    {expandedOrderId === order._id && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-gray-800">Shipping Address</h4>
                                <div className="text-sm text-gray-600 mt-1">
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Seller Information</h4>
                                {groupProductsBySeller(order.products).map(sellerGroup => (
                                    <div key={sellerGroup.details._id} className="mt-2 border-t pt-2">
                                        <p className="font-semibold">{sellerGroup.details.businessName}</p>
                                        <div className="text-sm text-gray-600">
                                            <p>Contact: {sellerGroup.details.contactNumber}</p>
                                            <p>UPI ID: {sellerGroup.details.paymentDetails?.upiId || 'N/A'}</p>
                                            <p>Bank: {sellerGroup.details.paymentDetails?.bankName} - A/C: {sellerGroup.details.paymentDetails?.accountNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Passcode Completion Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Complete Order</h2>
            <p className="mb-4 text-sm">Enter the 6-digit passcode for order <span className="font-mono">{selectedOrder._id}</span>.</p>
            <form onSubmit={handleCompleteOrder}>
                <input 
                    type="text" 
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    maxLength={6}
                    className="w-full p-3 border rounded text-2xl tracking-widest text-center"
                    required
                />
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Confirm Delivery</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}