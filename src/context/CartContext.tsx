// "use client";
// import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// export interface CartItem {
//   name: string;
//   image: string;
//   description: string;
//   calories: number;
//   protein: number;
//   amount: number; // Amount of this item in the cart
//   price: number;  // Price of the item
// }

// export interface WishlistItem extends Omit<CartItem, "amount"> {} // Wishlist items do not have an amount

// interface CartContextType {
//   cartItems: CartItem[];
//   wishlistItems: WishlistItem[];
//   addToCart: (item: Omit<CartItem, "amount"> & { amount?: number }) => void;
//   removeFromCart: (name: string) => void;
//   clearCart: () => void;
//   addToWishlist: (item: WishlistItem) => void;
//   removeFromWishlist: (name: string) => void;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const isClient = typeof window !== "undefined";

//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

//   // Load cart and wishlist from localStorage on mount
//   useEffect(() => {
//     if (isClient) {
//       try {
//         const storedCart = localStorage.getItem("cartItems");
//         const storedWishlist = localStorage.getItem("wishlistItems");
//         setCartItems(storedCart ? JSON.parse(storedCart) : []);
//         setWishlistItems(storedWishlist ? JSON.parse(storedWishlist) : []);
//       } catch (error) {
//         console.error("Failed to parse items from local storage:", error);
//       }
//     }
//   }, [isClient]);

//   // Save cart and wishlist to localStorage when they change
//   useEffect(() => {
//     if (isClient) {
//       try {
//         localStorage.setItem("cartItems", JSON.stringify(cartItems));
//         localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
//       } catch (error) {
//         console.error("Failed to save items to local storage:", error);
//       }
//     }
//   }, [cartItems, wishlistItems, isClient]);

//   const addToCart = (item: Omit<CartItem, "amount"> & { amount?: number }) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((cartItem) => cartItem.name === item.name);
//       const newAmount = Math.max(item.amount || 1, 1);
//       if (existingItem) {
//         return prevItems.map((cartItem) =>
//           cartItem.name === item.name
//             ? { ...cartItem, amount: cartItem.amount + newAmount }
//             : cartItem
//         );
//       } else {
//         return [...prevItems, { ...item, amount: newAmount }];
//       }
//     });
//   };

//   const removeFromCart = (name: string) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.name !== name));
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const addToWishlist = (item: WishlistItem) => {
//     setWishlistItems((prevItems) => {
//       const existingItem = prevItems.find((wishlistItem) => wishlistItem.name === item.name);
//       return existingItem ? prevItems : [...prevItems, item];
//     });
//   };

//   const removeFromWishlist = (name: string) => {
//     setWishlistItems((prevItems) => prevItems.filter((item) => item.name !== name));
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         wishlistItems,
//         addToCart,
//         removeFromCart,
//         clearCart,
//         addToWishlist,
//         removeFromWishlist,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// };

// export const useWishlist = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useWishlist must be used within a CartProvider");
//   }
//   return {
//     wishlistItems: context.wishlistItems,
//     removeFromWishlist: context.removeFromWishlist,
//   };
// };
"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  protein: number;
  price: number;
  amount: number;
}

export interface WishlistItem extends Omit<CartItem, "amount"> {}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, amount: number) => void;
  clearCart: () => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  syncWithDatabase: (buyerId: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart and wishlist from database on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const buyerId = sessionStorage.getItem("userId");
      if (buyerId) {
        syncWithDatabase(buyerId);
      }
    }
  }, []);

  const syncWithDatabase = async (buyerId: string) => {
    setLoading(true);
    try {
      // Fetch cart
      const cartRes = await fetch(`/api/buyer/cart?buyerId=${buyerId}`);
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData.items || []);
      }

      // Fetch wishlist
      const wishlistRes = await fetch(`/api/buyer/wishlist?buyerId=${buyerId}`);
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlistItems(wishlistData.items || []);
      }
    } catch (error) {
      console.error("Failed to sync with database:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => 
          i._id === item._id ? { ...i, amount: i.amount + item.amount } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = async (id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const updateCartItem = async (id: string, amount: number) => {
    setCartItems(prev => 
      prev.map(item => item._id === id ? { ...item, amount } : item)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToWishlist = async (item: WishlistItem) => {
    setWishlistItems(prev => 
      prev.some(i => i._id === item._id) ? prev : [...prev, item]
    );
  };

  const removeFromWishlist = async (id: string) => {
    setWishlistItems(prev => prev.filter(item => item._id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        syncWithDatabase,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};