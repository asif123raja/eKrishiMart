"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface BulkPrice {
  minQuantity: number;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  pricing: {
    basePrice: number;
    discountedPrice: number;
    currency: string;
    bulkPricing: BulkPrice[];
  };
  seller: {
    username: string;
    pincode: string;
  };
}

const BulkPricingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/buyer/allitems"); // adjust route if needed
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        setProducts(data.products);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading products...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Bulk Pricing List</h1>

      {products.map((product) => (
        <div
          key={product._id}
          className="mb-8 p-6 border rounded-lg shadow-md bg-white"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* ✅ FIX 2: Use the optimized Next.js Image component */}
            <Image
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              width={160} // 40 * 4 = 160px
              height={160} // w-40 h-40
              className="object-cover rounded-md"
            />


            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <p className="mb-1">
                <strong>Seller:</strong> {product.seller.username} (
                {product.seller.pincode})
              </p>
              <p className="mb-1">
                <strong>Base Price:</strong> {product.pricing.currency}{" "}
                {product.pricing.basePrice.toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Discounted Price:</strong> {product.pricing.currency}{" "}
                {product.pricing.discountedPrice.toLocaleString()}
              </p>

              {product.pricing.bulkPricing.length > 0 ? (
                <div>
                  <h3 className="font-semibold mt-4 underline">Bulk Pricing</h3>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {product.pricing.bulkPricing.map((bp, index) => (
                      <li key={index}>
                        {bp.minQuantity}+ units: {product.pricing.currency}{" "}
                        {bp.price.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No bulk pricing available.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulkPricingPage;
