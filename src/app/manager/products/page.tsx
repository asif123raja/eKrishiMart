"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// Types are correct
interface Product {
  _id: string; name: string; sku: string; image: string | null;
  quantity: number; category: string; price: number; expiry: string;
}
interface Seller {
  sellerId: string; businessName: string; contact: string; pincode: string;
  warehouseId: string; products: Product[];
}

export default function ManagerProductsPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProducts, setUpdatingProducts] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const managerEmail = sessionStorage.getItem('userEmail');
      // ✅ ADD THIS LINE
      console.log("Sending this email to backend:", managerEmail);
      
      if (!managerEmail) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/manager/sellerProducts", {
        headers: { 'x-user-id': managerEmail }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }
      setSellers(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // ✅ FIX: Removed the duplicate useEffect hook

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    try {
      setUpdatingProducts(prev => ({ ...prev, [productId]: true }));
      
      // ✅ FIX: Use 'userEmail' to be consistent with fetchData
      const managerEmail = sessionStorage.getItem('userEmail');
      
      if (!managerEmail) {
        toast.error("Session expired. Please login again.");
        return;
      }

      if (isNaN(newQuantity) || newQuantity < 0) {
        toast.error("Please enter a valid quantity");
        return;
      }

      const res = await fetch(`/api/manager/sellerProducts/${productId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          // ✅ FIX: Send the manager's email, not their ID
          'x-user-id': managerEmail
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update");
      }

      // Update state for a smooth user experience
      setSellers(prev => 
        prev.map(seller => ({
          ...seller,
          products: seller.products.map(p => 
            p._id === productId ? { ...p, quantity: data.product.quantity } : p
          )
        }))
      );
      toast.success("Quantity updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Your JSX return statement is good and doesn't need changes
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Warehouse Products Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">No sellers found in your warehouse&apos;s serviceable pincodes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sellers.map(seller => (
            <div key={seller.sellerId} className="border rounded-lg p-4 shadow">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{seller.businessName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                  <p><span className="font-medium">Contact:</span> {seller.contact}</p>
                  <p><span className="font-medium">Pincode:</span> {seller.pincode}</p>
                  <p><span className="font-medium">Warehouse ID:</span> {seller.warehouseId}</p>
                </div>
              </div>

              {seller.products.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No products found for this seller</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">Product</th>
                        <th className="py-2 px-4 border">SKU</th>
                        <th className="py-2 px-4 border">Category</th>
                        <th className="py-2 px-4 border">Price</th>
                        <th className="py-2 px-4 border">Expiry</th>
                        <th className="py-2 px-4 border">Quantity</th>
                        <th className="py-2 px-4 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seller.products.map(product => (
                        <tr key={product._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 border">
                            <div className="flex items-center">
                              {product.image && (
                                <div className="relative h-10 w-10 mr-2">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                  />
                                </div>
                              )}
                              {product.name}
                            </div>
                          </td>
                          <td className="py-2 px-4 border">{product.sku}</td>
                          <td className="py-2 px-4 border">{product.category}</td>
                          <td className="py-2 px-4 border">₹{product.price}</td>
                          <td className="py-2 px-4 border">{product.expiry}</td>
                          <td className="py-2 px-4 border">
                            <input
                              type="number"
                              min="0"
                              defaultValue={product.quantity}
                              className="border rounded px-2 py-1 w-20"
                              onBlur={(e) => handleQuantityUpdate(
                                product._id, 
                                parseInt(e.target.value) || 0
                              )}
                              disabled={updatingProducts[product._id]}
                            />
                          </td>
                          <td className="py-2 px-4 border">
                            {updatingProducts[product._id] && (
                              <span className="text-blue-500 text-sm">Updating...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}