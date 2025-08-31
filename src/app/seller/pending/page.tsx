'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ✅ Define a TypeScript interface based on your product schema for type safety
interface PendingProduct {
  _id: string;
  name: string;
  sku: string;
  imageUrl: string;
  itemQuantity: number;
  status: string;
  pricing: {
    basePrice: number;
    discountedPrice?: number;
  };
  createdAt: string;
}

export default function PendingProductsPage() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        const res = await fetch('/api/seller/pending');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        setProducts(data.products || []);
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

    fetchPendingProducts();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading your pending products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Products Awaiting Approval</h1>
        
        {products.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow">
            <p className="text-gray-500">You have no products pending for approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48 w-full">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">{product.sku}</p>
                  <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
                  <div className="mt-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Stock: {product.itemQuantity}</p>
                      <p className="text-lg font-bold text-gray-900">₹{product.pricing.basePrice.toFixed(2)}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      Pending
                    </span>
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