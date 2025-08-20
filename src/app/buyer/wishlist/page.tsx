// "use client";
// import { useEffect, useState } from "react";

// export default function WishlistPage() {
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const buyerId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (!buyerId) return;

//       setLoading(true);
//       try {
//         const res = await fetch(`/api/buyer/wishlist?buyerId=${buyerId}`);
//         const data = await res.json();
//         if (res.ok) {
//           setWishlist(data.wishlist);
//         } else {
//           alert(data.error);
//         }
//       } catch (err) {
//         alert("Error loading wishlist");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWishlist();
//   }, [buyerId]);

//   const removeFromWishlist = async (productId: string) => {
//     try {
//       const res = await fetch("/api/buyer/wishlist", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ buyerId, productId }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setWishlist((prev) => prev.filter((item: any) => item.productId._id !== productId));
//         alert("Removed from wishlist");
//       } else {
//         alert(data.error);
//       }
//     } catch (error) {
//       alert("Error removing item");
//     }
//   };

//   return (
//     <div className="min-h-screen px-6 py-10 bg-gray-50">
//       <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
//       {loading ? (
//         <p>Loading...</p>
//       ) : wishlist.length === 0 ? (
//         <p>No items in your wishlist.</p>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
//           {wishlist.map((item: any) => (
//             <div key={item._id} className="bg-white shadow p-4 rounded-lg">
//               <h2 className="text-lg font-semibold">{item.productId?.name || "Unknown Item"}</h2>
//               <p className="text-sm text-gray-500">{item.productId?.sku}</p>
//               <button
//                 onClick={() => removeFromWishlist(item.productId._id)}
//                 className="mt-3 text-red-500 hover:underline"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
'use client';
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from 'react-hot-toast';

// ✅ 1. Create a more detailed type for the populated product data
interface PopulatedProduct {
  _id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  description: string;
  nutrition: {
    calories: number;
    protein: number;
  };
  pricing: {
    basePrice: number;
    discountedPrice?: number;
  };
}

// Use the detailed product type in your WishlistItem
interface WishlistItem {
  _id: string;
  productId: PopulatedProduct;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const buyerId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!buyerId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/buyer/wishlist?buyerId=${buyerId}`);
        const data = await res.json();
        if (res.ok) {
          setWishlist(data.wishlist);
        } else {
          toast.error(data.error || "Failed to load wishlist");
        }
      } catch (err) {
        toast.error("Error loading wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [buyerId]);

  // const removeFromWishlist = async (productId: string) => {
  //   // ... your removeFromWishlist logic is correct ...
  //   try {
  //     const res = await fetch("/api/buyer/wishlist", {
  //       method: "DELETE",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ buyerId, productId }),
  //     });
  //     const data = await res.json();
  //     if (res.ok) {
  //       setWishlist((prev) => prev.filter((item) => item.productId._id !== productId));
  //       toast.success("Removed from wishlist");
  //     } else {
  //       toast.error(data.error || "Error removing item");
  //     }
  //   } catch (error) {
  //     toast.error("Error removing item");
  //   }
  // };

  // ✅ 2. Update the handleAddToCart function
  
  const removeFromWishlist = async (productId: string) => {
  try {
    const res = await fetch("/api/buyer/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerId, productId }),
    });

    const data = await res.json();
    if (res.ok) {
      // Update state
      setWishlist((prev) => prev.filter((item) => item.productId._id !== productId));

      // ✅ Update sessionStorage
      const wishlistRaw = sessionStorage.getItem("wishlist");
      const wishlist: string[] = wishlistRaw ? JSON.parse(wishlistRaw) : [];
      const updatedWishlist = wishlist.filter((id) => id !== productId);
      sessionStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

      toast.success("Removed from wishlist");
    } else {
      toast.error(data.error || "Error removing item");
    }
  } catch (error) {
    toast.error("Error removing item");
  }
};

  
  const handleAddToCart = (item: WishlistItem) => {
    try {
      // Construct an object that fully matches the 'CartItem' type
      const itemToAdd = {
        // Properties from the product
        _id: item.productId._id,
        name: item.productId.name,
        image: item.productId.imageUrl || "/images/placeholder.png",
        description: item.productId.description,
        calories: item.productId.nutrition.calories,
        protein: item.productId.nutrition.protein,
        price: item.productId.pricing.discountedPrice ?? item.productId.pricing.basePrice,
        
        // Add the quantity
        amount: 1, 
      };

      addToCart(itemToAdd);
      toast.success(`${item.productId.name} added to cart!`);

    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      {loading ? (
        <p>Loading...</p>
      ) : wishlist.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
          {wishlist.map((item) => (
            <div key={item._id} className="bg-white shadow p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold">{item.productId?.name || "Unknown Item"}</h2>
                <p className="text-sm text-gray-500">SKU: {item.productId?.sku}</p>
                {/* You can now display more details if you want */}
                <p className="text-gray-700 mt-2">
                  Price: ₹{item.productId.pricing.discountedPrice ?? item.productId.pricing.basePrice}
                </p>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.productId._id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}