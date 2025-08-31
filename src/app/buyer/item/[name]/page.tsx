"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
type Vitamins = { [key: string]: string };
type Minerals = { [key: string]: string };

interface Seller {
  _id?: string;
  username: string;
  pincode?: string;
  sku?: string;
}

interface ItemData {
  _id?: string;
  name: string;
  image: string | null;
  description: string;
  calories: number;
  protein: number;
  vitamins: Vitamins;
  minerals: Minerals;
  price: number;
  discounted_price: number;
  currency: string;
  quantity: number;
  bulkPricing?: { minQuantity: number; price: number }[];
  seller?: Seller;
}

const ItemPage: React.FC = () => {
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const router = useRouter();

  useEffect(() => {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem("itemData");
    console.log("Raw itemData from sessionStorage:", data);
    
    if (data) {
      try {
        const parsed: ItemData = JSON.parse(data);
        console.log("Successfully parsed itemData:", {
          _id: parsed._id, // Changed from id to _id
          name: parsed.name,
          hasImage: !!parsed.image,
          seller: parsed.seller?.username
        });
        
        setItemData(parsed);

        const wishlistRaw = sessionStorage.getItem("wishlist");
        console.log("Raw wishlist data:", wishlistRaw);
        
        const wishlist: string[] = wishlistRaw ? JSON.parse(wishlistRaw) : [];
        console.log("Current wishlist items:", wishlist);
        
        if (parsed._id && wishlist.includes(parsed._id)) { // Changed from id to _id
          console.log("Item found in wishlist, marking as added");
          setWishlistAdded(true);
        } else {
          console.log("Item not in wishlist");
        }
      } catch (err) {
        console.error("Error parsing itemData:", err);
        setError("Failed to parse item data.");
      }
    } else {
      console.warn("No itemData found in sessionStorage");
      setError("Item data not found.");
    }
    
    setLoading(false);
  }
}, []);

const handleAddToCart = async () => {
  if (itemData) {
    const qty = Math.min(Math.max(amount, 1), itemData.quantity);

    const buyerId = sessionStorage.getItem("userId");
    if (!buyerId) return alert("You must be logged in");

    const res = await fetch("/api/buyer/addtocart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId,
        productId: itemData._id, // Changed from id to _id
        sku: itemData.seller?.sku || "DEFAULT",
        quantity: qty
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Added ${qty} x ${itemData.name} to cart.`);
    } else {
      alert("Failed to add to cart: " + data.error);
    }
  }
};

const handleAddToWishlist = async () => {
  if (!itemData || !itemData._id) { // Changed from id to _id
    alert("Item data is not available");
    return;
  }

  const buyerId = sessionStorage.getItem("userId");
  if (!buyerId) {
    router.push("/login");
    return;
  }

  try {
    const res = await fetch("/api/buyer/addtowishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId,
        productId: itemData._id // Changed from id to _id
      })
    });
    console.log("Adding to wishlist:", { buyerId, productId: itemData._id });

    const data = await res.json();
    
    if (!res.ok) {
      if (data.error?.includes("already exists")) {
        setWishlistAdded(true);
        alert(`${itemData.name} is already in your wishlist.`);
      } else {
        throw new Error(data.error || "Failed to add to wishlist");
      }
    } else {
      setWishlistAdded(true);
      
      const wishlistRaw = sessionStorage.getItem("wishlist");
      const wishlist: string[] = wishlistRaw ? JSON.parse(wishlistRaw) : [];
      if (!wishlist.includes(itemData._id)) { // Changed from id to _id
        wishlist.push(itemData._id);
        sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
      }
      
      alert(`${itemData.name} added to wishlist successfully!`);
    }
  } catch (error) {
    console.error("Wishlist error:", error);
    alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};


  if (loading) return <p>Loading item details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!itemData) return <p>No item data available.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{itemData.name}</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-1/3">
          {/* ✅ 3. Replace <img> with the optimized <Image> component */}
          <Image
            src={itemData.image || "/images/placeholder.png"}
            alt={itemData.name}
            width={400} // Provide a base width for the image
            height={400} // Provide a base height for the image
            className="rounded-lg object-cover w-full h-auto shadow-lg"
          />
        </div>

        {/* Details */}
        <div className="flex-grow">
          <p className="mb-4">{itemData.description}</p>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Nutrition Facts</h2>
            <ul className="list-disc list-inside">
              <li>Calories: {itemData.calories}</li>
              <li>Protein: {itemData.protein} g</li>
              {itemData.vitamins && Object.keys(itemData.vitamins).length > 0 && (
                <>
                  <li>Vitamins:</li>
                  <ul className="list-disc list-inside ml-5">
                    {Object.entries(itemData.vitamins).map(([key, val]) => (
                      <li key={key}>
                        {key}: {val}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {itemData.minerals && Object.keys(itemData.minerals).length > 0 && (
                <>
                  <li>Minerals:</li>
                  <ul className="list-disc list-inside ml-5">
                    {Object.entries(itemData.minerals).map(([key, val]) => (
                      <li key={key}>
                        {key}: {val}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </ul>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold">
            Price: {itemData?.currency ?? "INR"}{" "}
            {(itemData?.discounted_price ?? 0).toLocaleString()}
            {(itemData?.discounted_price ?? 0) < (itemData?.price ?? 0) && (
                <span className="line-through text-red-500 ml-2">
                {itemData?.currency ?? "INR"} {(itemData?.price ?? 0).toLocaleString()}
                </span>
            )}
            </p>

            <p>Available Quantity: {itemData.quantity}</p>
          </div>

          {/* Bulk Pricing */}
          {itemData.bulkPricing && itemData.bulkPricing.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold underline mb-2">Bulk Pricing</h3>
              <ul className="list-disc list-inside ml-5">
                {itemData.bulkPricing.map((bp, i) => (
                  <li key={i}>
                    {bp.minQuantity}+ units: {itemData.currency}{" "}
                    {bp.price.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seller Info */}
          {itemData.seller && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50 text-black">
              <h3 className="text-xl font-semibold mb-2">Seller Details</h3>
              <p>
                <strong>Username:</strong> {itemData.seller.username}
              </p>
              {itemData.seller.pincode && (
                <p>
                  <strong>Pincode:</strong> {itemData.seller.pincode}
                </p>
              )}
              {itemData.seller.sku && (
                <p>
                  <strong>SKU:</strong> {itemData.seller.sku}
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-4 flex items-center space-x-3">
            <label htmlFor="quantity" className="font-semibold">
              Quantity:
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={itemData.quantity}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-center"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={amount < 1 || amount > itemData.quantity}
              className={` cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Add to Cart
            </button>

            <button
              onClick={handleAddToWishlist}
              disabled={wishlistAdded}
              className={` cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {wishlistAdded ? "Added to Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
