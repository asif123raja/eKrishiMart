"use client";

import React, { useEffect } from "react";
import Link from "next/link";

const SellerLandingPage: React.FC = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("translate-y-0", "opacity-100");
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full text-center fade-in opacity-0 translate-y-8 transition duration-500">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Welcome, Seller! 🌿
        </h1>
        <p className="text-gray-700 mb-6">
          Manage your fresh produce listings, update stock, and grow your market on Krishi Mart.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/seller/addproduct">
            <button className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-500 transition">
              Add Product
            </button>
          </Link>
          <Link href="/seller/products">
            <button className="bg-gray-200 text-teal-700 px-6 py-2 rounded hover:bg-gray-300 transition">
              Manage Stock
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerLandingPage;
