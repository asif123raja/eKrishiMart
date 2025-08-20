'use client';

import { useEffect, useState } from 'react';

// Define a type for our pending product data for better TypeScript support
interface PendingProduct {
  _id: string;
  name: string;
  category: string;
  itemQuantity: number;
  sellerId: {
    businessName: string;
  };
  createdAt: string;
}

export default function ApprovalsPage() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch pending products when the component mounts
  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        const response = await fetch('/api/manager/pending');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setPendingProducts(data);
      } catch (err: any) {
        setError(err.message);
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

    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.sellerId.businessName}</td>
                  <td className="px-6 py-4">{product.category}</td>

                  <td className="px-6 py-4">{product.itemQuantity}</td>
                  <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleProcessRequest(product._id, 'approve')}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleProcessRequest(product._id, 'reject')}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
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
    </div>
  );
}