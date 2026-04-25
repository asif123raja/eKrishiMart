"use client"; // Use this directive if you're using Next.js with the App Router

import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component
import React, { useEffect } from "react";
// import { FaApple, FaCarrot, FaBoxOpen } from "react-icons/fa"; // Import icons or use images as needed

const FrontPage: React.FC = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const options = {
      root: null, // Use the viewport as the container
      threshold: 0.1, // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("translate-y-0", "opacity-100");
          entry.target.classList.remove("opacity-0");
          observer.unobserve(entry.target); // Stop observing once it has animated
        }
      });
    }, options);

    elements.forEach((element) => {
      observer.observe(element); // Observe each element
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element); // Cleanup observer
      });
    };
  }, []);

  const customerReviews = [
    {
      name: "Alice Johnson",
      review: "Great service and fresh products! Highly recommended for quality.",
    },
    {
      name: "Michael Smith",
      review: "I love the variety of fruits available. Always fresh and delicious!",
    },
    {
      name: "Sara Williams",
      review: "The delivery was prompt, and the vegetables were top-notch!",
    },
    {
      name: "David Brown",
      review: "Fantastic experience! The prices are unbeatable for the quality.",
    },
  ];

  return (
    <div className="overflow-hidden bg-gray-50/20">
      {/* Background Section */}
      <div className="relative bg-cover bg-center h-[400px] sm:h-[700px] shadow-inner" style={{ backgroundImage: "url('/images/front.jpg')" }}>
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black/70 to-transparent bg-opacity-50">
          <h1 className="text-5xl sm:text-7xl text-white font-extrabold mb-6 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out text-center drop-shadow-xl tracking-tight">
            Embrace the <span className="text-lime-400">Freshness</span>
          </h1>
          <Link href="/shop">
            <button className="bg-lime-500 text-teal-900 font-bold px-8 py-4 rounded-full hover:bg-lime-400 hover:scale-105 hover:shadow-lg transition-all duration-300 transform fade-in translate-y-8 opacity-0">
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="p-8 sm:p-16 text-center bg-gray-50/50">
        <h2 className="text-4xl font-extrabold mb-4 text-teal-900 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out">
          Welcome to <span className="text-teal-600">Krishi Mart!</span>
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out leading-relaxed">
          Discover a wide range of fresh and organic produce sourced directly from local farms.
          Our mission is to bring the best of nature to your doorstep while supporting sustainable farming practices.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out">
          Join us in our journey to promote healthy eating and a greener planet.
        </p>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-6 sm:p-12 bg-white">
        {[
          { title: "Fruits Section", image: "/images/fruits.jpg" },
          { title: "Veggies Section", image: "/images/veggies.jpg" },
          { title: "All Items", image: "/images/allitems.webp" },
        ].map((section, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center justify-center p-4 rounded-2xl shadow-md overflow-hidden fade-in translate-y-8 opacity-0 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 cursor-pointer"
            style={{
              backgroundImage: `url(${section.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '250px',
            }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
            <h2 className="relative text-2xl font-bold text-white mb-4 drop-shadow-md">{section.title}</h2>
            <Link href={`/${section.title.toLowerCase().replace(" section", "").replace(" ", "")}`} className="relative bg-teal-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-teal-500 transition-colors duration-300 shadow-lg">
              View {section.title}
            </Link>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="flex flex-col md:flex-row items-center p-6 sm:p-16 bg-teal-50">
        <div className="md:w-1/2 p-6 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out">
          <h2 className="text-4xl font-extrabold mb-6 text-teal-900">Why Choose Us?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            At our core, we believe in delivering the freshest produce directly from local farms to your table. Our dedicated team carefully selects fruits and vegetables, ensuring that only the highest quality products make it to our customers. We prioritize freshness, flavor, and nutrition, so you can enjoy the best nature has to offer.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Sustainability is at the heart of what we do. By partnering with local farmers, we support eco-friendly practices that reduce our carbon footprint and promote biodiversity. Our commitment to sustainable sourcing means that you can feel good about your choices while enjoying delicious, wholesome foods.
          </p>
        </div>
        <div className="md:w-1/2 p-6 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out relative group">
          <div className="absolute inset-0 bg-teal-200 rounded-3xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500"></div>
          <Image src="/images/picking fruits.jpg" alt="Why Choose Us" width={500} height={300} className="relative z-10 w-full rounded-3xl shadow-xl group-hover:-translate-y-2 transition-transform duration-500" />
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-6 sm:p-16">
        <h2 className="text-4xl font-extrabold text-center text-teal-900 mb-12 fade-in translate-y-8 opacity-0 transition-transform duration-700 ease-out">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {customerReviews.map((customer, index) => (
            <div
              key={index}
              className="relative p-8 border border-gray-100 rounded-2xl shadow-lg bg-white fade-in translate-y-8 opacity-0 hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 ease-out group"
            >
              <div className="absolute top-0 left-0 w-10 h-10 bg-teal-100 rounded-full mix-blend-multiply opacity-50 transform -translate-x-2 -translate-y-2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-lime-100 rounded-full mix-blend-multiply opacity-50 transform translate-x-2 translate-y-2 group-hover:scale-150 transition-transform duration-500"></div>
              <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center justify-center">{customer.name}</h3>
              <p className="text-gray-600 text-center italic leading-relaxed">&quot;{customer.review}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FrontPage;
