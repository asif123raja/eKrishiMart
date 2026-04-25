"use client";
import React, { useState } from "react";
import { FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import Link from "next/link";
import Image from 'next/image';
import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/CartContext";

const Header: React.FC = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems = [] } = useCart();
   // ✅ ADD THIS LINE TO DEBUG
  console.log("DATA FROM AUTH CONTEXT:", { isAuthenticated, role });
  return (
    <nav className="bg-teal-600/90 backdrop-blur-md shadow-lg sticky top-2 mx-4 z-50 p-4 rounded-2xl transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center hover:scale-105 transition-transform duration-300 hover:cursor-pointer">
          <Image
            src="/images/logo1.jpg"
            alt="Logo"
            className="rounded-3xl h-12 w-12 mr-2 shadow-sm"
            width={40} height={40}
          />
          <span className="hidden md:block text-white text-4xl font-extrabold tracking-tight">
            <span className="text-lime-300 drop-shadow-md">Krishi</span>
            <span className="text-white drop-shadow-md">Mart</span>
          </span>
        </div>

        {/* Mobile Menu & Cart */}
        <div className="flex items-center md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Corrected role to 'buyer' to be consistent */}
          {role === "buyer" && (
            <Link href="/buyer/cart" className="relative text-white ml-4 mt-1">
              <FaShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {role === "buyer" && (
            <>
              <Link href="/buyer/wishlist" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Wishlist
              </Link>
              <Link href="/buyer/orderHistory" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Orders
              </Link>
              <Link href="/buyer/fruits" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Fruits
              </Link>
              <Link href="/buyer/allitems" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                All Items
              </Link>
              <Link href="/buyer/helpsection" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Help Section
              </Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                Logout
              </button>
            </>
          )}

          {role === "seller" && (
            <>
              <Link href="/seller/profile" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Profile
              </Link>
              <Link href="/seller/addproduct" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Create New Item
              </Link>
              <Link href="/seller/products" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Update Item
              </Link>
              <Link href="/seller/orders" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Orders
              </Link>
              <Link href="/seller/pending" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Pending
              </Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                Logout
              </button>
            </>
          )}

          {/* ✅ NEW: Manager Navigation for Desktop */}
          {role === "manager" && (
            <>
              <Link href="/manager/orders" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Buyer Orders
              </Link>
              <Link href="/manager/orders/completed" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Completed Orders
              </Link>
              <Link href="/manager/pending" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Seller Pending
              </Link>
              <Link href="/manager/products" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                ALL Items
              </Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                Logout
              </button>
            </>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated && (
            <Link href="/login" className="text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
              Sign In/Signup
            </Link>
          )}

          {/* Cart for buyers */}
          {role === "buyer" && (
            <Link href="/buyer/cart" className="relative text-white ml-4 mt-1">
              <FaShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={() => setIsOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-gradient-to-b from-teal-700 to-teal-900 z-50 p-6 shadow-2xl rounded-l-2xl animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white">
              <FaTimes size={30} />
            </button>

            {role === "buyer" && (
              <>
                <Link href="/buyer/wishlist" className="block text-white text-lg py-4 hover:text-teal-300">
                  Wishlist
                </Link>
                <Link href="/buyer/orderHistory" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Orders
                </Link>
                <Link href="/buyer/fruits" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Fruits
                </Link>
                <Link href="/buyer/allitems" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  All Items
                </Link>
                <Link href="/buyer/helpsection" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Help Section
                </Link>
                <button onClick={logout} className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                  Logout
                </button>
              </>
            )}

            {role === "seller" && (
              <>
                <Link href="/seller/profile" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Profile
                </Link>
                <Link href="/seller/orders" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Orders
                </Link>
                <Link href="/seller/addproduct" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Create New Item
                </Link>
                <Link href="/seller/products" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Update Item
                </Link>
                <Link href="/seller/orders" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Orders
                </Link>
                <Link href="/seller/pending" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Pending
              </Link>
                <button onClick={logout} className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                  Logout
                </button>
              </>
            )}
            
            {/* ✅ NEW: Manager Navigation for Mobile */}
            {role === "manager" && (
              <>
                <Link href="/manager/orders" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Buyer Orders
                </Link>
                <Link href="/manager/orders/completed" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Completed Orders
                </Link>
                <Link href="/manager/pending" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  Seller Pending
                </Link>
                <Link href="/manager/products" className="block text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                  ALL Items
                </Link>
                <button onClick={logout} className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                  Logout
                </button>
              </>
            )}

            {/* Auth Buttons for mobile */}
            {!isAuthenticated && (
                <Link href="/login" className="block text-white text-lg py-4 hover:text-teal-300">
                  Sign In/Signup
                </Link>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Header;