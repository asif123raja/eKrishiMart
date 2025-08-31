"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";

type Seller = {
  _id: string;
  username: string;
  pincode: string;
  sku: string;
};

type Product = {
  _id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  itemQuantity: number;
  description: string;
  category: string;
  variety: string;
  nutrition: {
    calories: number;
    protein: number;
  };
  minerals: any;
  pricing: {
    basePrice: number;
    discountedPrice: number;
    currency: string;
    bulkPricing?: {
      minQuantity: number;
      price: number;
    }[];
  };
  seller: Seller;
};

export default function NearbyWarehouseProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Check if we're on client side
        if (typeof window === 'undefined') return;

        const res = await fetch("/api/buyer/allitems", {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setProducts(data.products || []);
        setError(null);
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleItemClick = (product: Product) => {
    try {
      sessionStorage.setItem("itemData", JSON.stringify({
        _id: product._id,
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        calories: product.nutrition.calories,
        protein: product.nutrition.protein,
        vitamins: {},
        minerals: product.minerals,
        price: product.pricing.basePrice,
        discounted_price: product.pricing.discountedPrice,
        currency: product.pricing.currency,
        quantity: product.itemQuantity,
        bulkPricing: product.pricing.bulkPricing || [],
        seller: product.seller
      }));
      
      router.push(`/buyer/item/${encodeURIComponent(product.name)}`);
    } catch (err) {
      console.error("Error storing item data:", err);
    }
  };

  const truncateDescription = (description: string, wordCount: number) => {
    const words = description.split(" ");
    return words.length > wordCount
      ? words.slice(0, wordCount).join(" ") + "..."
      : description;
  };

  if (loading) return <p className="p-6">Loading products...</p>;
  
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  
  if (products.length === 0) {
    return <p className="p-6">No products available in your warehouse region.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products in Your Warehouse Region</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <article 
            key={product._id} 
            className="border rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleItemClick(product)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleItemClick(product);
              }
            }}
          >
            <Card
              _id={product._id}
              image={product.imageUrl || "/images/placeholder.png"}
              name={product.name}
              description={truncateDescription(product.description, 6)}
              itemData={{
                _id: product._id,
                name: product.name,
                image: product.imageUrl || "/images/placeholder.png",
                description: product.description,
                calories: product.nutrition.calories,
                protein: product.nutrition.protein,
                vitamins: {},
                minerals: product.minerals,
                price: product.pricing.basePrice,
                discounted_price: product.pricing.discountedPrice,
                currency: product.pricing.currency,
                quantity: product.itemQuantity,
                bulkPricing: product.pricing.bulkPricing || [],
              }}
              seller={product.seller}
            />
          </article>
        ))}
      </div>
    </div>
  );
}