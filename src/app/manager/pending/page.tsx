'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ✅ Define more detailed types to match the new data from the API
interface SellerDetails {
  _id: string;
  username: string;
  businessName: string;
  contactNumber: string;
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentDetails: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
}

interface PendingProduct {
  _id: string;
  name: string;
  category: string;
  itemQuantity: number;
  status: 'pending' | 'awaiting-payment';
  deliveryPaymentStatus: string;
  sellerId: SellerDetails; // Use the detailed seller type
  createdAt: string;
}

export default function ApprovalsPage() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ NEW: State to manage the seller details modal
  const [selectedSeller, setSelectedSeller] = useState<SellerDetails | null>(null);

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        const response = await fetch('/api/manager/pending');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setPendingProducts(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPendingProducts();
  }, []);

  // Handler function to approve or reject a product
  const handleProcessRequest = async (productId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/manager/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingProductId: productId, action }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong');
      
      // If successful, remove the item from the list for instant UI feedback
      setPendingProducts(currentProducts => 
        currentProducts.filter(p => p._id !== productId)
      );
      alert(`Product successfully ${action}d!`);

    }catch (error: unknown) {
      if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
      } else {
          toast.error("An unknown error occurred.");
      }
    }
  };

  if (loading) return <p className="text-center mt-8">Loading pending products...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Product Approvals</h1>
      {pendingProducts.length === 0 ? (
        <p>No pending products to review.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Status</th> {/* ✅ ADDED status column */}
                <th className="px-6 py-3">Payment</th> {/* ✅ ADDED payment status column */}
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">
                    {/* ✅ Seller name is now a button to open the modal */}
                    <button 
                      onClick={() => setSelectedSeller(product.sellerId)} 
                      className="text-blue-600 hover:underline"
                    >
                      {product.sellerId.businessName}
                    </button>
                  </td>
                  <td className="px-6 py-4">{product.itemQuantity}</td>
                  <td className="px-6 py-4">
                    {/* ✅ Show product status with styling */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{product.deliveryPaymentStatus}</td>
                  <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    {/* Disable buttons if payment is still pending */}
                    <button
                      onClick={() => handleProcessRequest(product._id, 'approve')}
                      disabled={product.status === 'awaiting-payment'}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleProcessRequest(product._id, 'reject')}
                      disabled={product.status === 'awaiting-payment'}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ NEW: Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Seller Information</h2>
            
            <div className="space-y-3">
              <p><strong>Seller ID:</strong> {selectedSeller._id}</p>
              <p><strong>Full Name:</strong> {selectedSeller.username}</p>
              <p><strong>Business Name:</strong> {selectedSeller.businessName}</p>
              <p><strong>Contact:</strong> {selectedSeller.contactNumber}</p>
              
              <div className="pt-2 border-t">
                <h3 className="font-semibold">Business Address:</h3>
                <p>{selectedSeller.businessAddress.addressLine1}, {selectedSeller.businessAddress.addressLine2}</p>
                <p>{selectedSeller.businessAddress.city}, {selectedSeller.businessAddress.state} - {selectedSeller.businessAddress.pincode}</p>
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-semibold">Payment Details:</h3>
                <p><strong>Bank:</strong> {selectedSeller.paymentDetails.bankName || 'N/A'}</p>
                <p><strong>Account No:</strong> {selectedSeller.paymentDetails.accountNumber || 'N/A'}</p>
                <p><strong>IFSC:</strong> {selectedSeller.paymentDetails.ifscCode || 'N/A'}</p>
                <p><strong>UPI ID:</strong> {selectedSeller.paymentDetails.upiId || 'N/A'}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSeller(null)}
              className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}