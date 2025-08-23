"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

type Product = {
  _id: string;
  name: string;
  image: string | null;
  sku: string;
  sellerSku: string;
  itemQuantity: number;
};

export default function SellerProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem('userId');
      console.log("session is empty if undefined userid", userId)
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      const res = await fetch("/api/seller/products", {
        headers: {
          'x-user-id': userId
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (id: string, newQuantity: number) => {
    try {
      setUpdatingId(id);
      const userId = sessionStorage.getItem('userId');
      
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      if (isNaN(newQuantity) || newQuantity < 0) {
        toast.error("Please enter a valid quantity");
        return;
      }

      const res = await fetch(`/api/seller/products/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ itemQuantity: newQuantity })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update");
      }

      setProducts(prev => 
        prev.map(p => p._id === id ? { ...p, itemQuantity: newQuantity } : p)
      );
      toast.success("Quantity updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Products</h1>
      
      {loading && !products.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 relative bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Product SKU:</span> {product.sku}</p>
                  <p><span className="font-medium">Seller SKU:</span> {product.sellerSku}</p>
                  
                  <div className="flex items-center mt-3">
                    <label className="mr-2 font-medium">Quantity:</label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.itemQuantity}
                      className="border rounded px-2 py-1 w-20"
                      onBlur={(e) => handleQuantityUpdate(
                        product._id, 
                        parseInt(e.target.value) || 0
                      )}
                      disabled={updatingId === product._id}
                    />
                    {updatingId === product._id && (
                      <span className="ml-2 text-blue-500">Updating...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}