
// "use client";

// import { useEffect, useState } from "react";
// import Card from "@/components/ui/card";

// type Seller = {
//   _id: string;
//   username: string;
//   pincode: string;
//   sku: string;
// };

// type Product = {
//   _id: string;
//   name: string;
//   sku: string;
//   imageUrl: string | null;
//   itemQuantity: number;
//   description: string;
//   category: string;
//   variety: string;
//   nutrition: {
//     calories: number;
//     protein: number;
//   };
//   minerals: any;
//   pricing: {
//     basePrice: number;
//     discountedPrice: number;
//     currency: string;
//     bulkPricing?: {
//       minQuantity: number;
//       price: number;
//     }[];
//   };
//   seller: Seller;
// };


// export default function NearbyWarehouseProducts() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const userId = sessionStorage.getItem("userId"); // ✅ get userId from sessionStorage

//         const res = await fetch("/api/buyer/allitems", {
//           headers: {
//             "Content-Type": "application/json",
//             "x-user-id": userId || "", // ✅ send it in a custom header
//           },
//         });

//         const data = await res.json();
//         if (res.ok) {
//           setProducts(data.products);
//         } else {
//           alert(data.error || "Failed to load products");
//         }
//       } catch (err) {
//         console.error(err);
//         alert("Error fetching products");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProducts();
//   }, []);


//   if (loading) return <p>Loading products...</p>;
//   if (products.length === 0)
//     return <p>No products available in your warehouse region.</p>;

//   const truncateDescription = (description: string, wordCount: number) => {
//     const words = description.split(" ");
//     return words.length > wordCount
//       ? words.slice(0, wordCount).join(" ") + "..."
//       : description;
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Products in Your Warehouse Region</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {products.map((product) => (
//             <div key={product._id} className="border rounded-lg p-4 shadow">
//               <Card
//                 _id= {product._id}
//                 image={product.imageUrl || "/images/placeholder.png"}
//                 name={product.name}
//                 description={truncateDescription(product.description, 6)}
//                 itemData={{
//                   _id: product._id,
//                   name: product.name,
//                   image: product.imageUrl || "/images/placeholder.png",
//                   description: product.description,
//                   calories: product.nutrition.calories,
//                   protein: product.nutrition.protein,
//                   vitamins: {},
//                   minerals: product.minerals,
//                   price: product.pricing.basePrice,
//                   discounted_price: product.pricing.discountedPrice,
//                   currency: product.pricing.currency,
//                   quantity: product.itemQuantity,
//                   bulkPricing: product.pricing.bulkPricing || [], // ✅ ADD THIS LINE
//                 }}
//                 seller={product.seller}
//               />


              
//             </div>
//           ))}

//       </div>
//     </div>
//   );
// }
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
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const userId = sessionStorage.getItem("userId");
        const res = await fetch("/api/buyer/allitems", {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
        });

        const data = await res.json();
        if (res.ok) {
          setProducts(data.products);
        } else {
          alert(data.error || "Failed to load products");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleItemClick = (product: Product) => {
    // Store the product data in sessionStorage
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
    
    // Navigate to the item detail page
    router.push(`/buyer/item/${encodeURIComponent(product.name)}`);
  };

  if (loading) return <p>Loading products...</p>;
  if (products.length === 0)
    return <p>No products available in your warehouse region.</p>;

  const truncateDescription = (description: string, wordCount: number) => {
    const words = description.split(" ");
    return words.length > wordCount
      ? words.slice(0, wordCount).join(" ") + "..."
      : description;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products in Your Warehouse Region</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="border rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleItemClick(product)}
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
          </div>
        ))}
      </div>
    </div>
  );
}