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
    <div className="overflow-hidden ">
      {/* Background Section */}
      <div className="relative bg-cover  bg-center h-[300px] sm:h-[700px]" style={{ backgroundImage: "url('/images/front.jpg')" }}>
        <div className="flex flex-col items-center justify-center h-full bg-black bg-opacity-50">
          <h1 className="text-4xl sm:text-5xl text-white font-bold mb-4 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out text-center">
            Embrace the Freshness
          </h1>
          <Link href="/shop">
            <button className="bg-teal-600 text-white px-6 py-3 rounded hover:bg-teal-500 transition duration-600 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="p-4 sm:p-8 text-center bg-white">
        <h2 className="text-3xl font-bold mb-2 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
          Welcome to Krishi Mart!
        </h2>
        <p className="text-gray-700 mb-4 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
          Discover a wide range of fresh and organic produce sourced directly from local farms.
          Our mission is to bring the best of nature to your doorstep while supporting sustainable farming practices.
        </p>
        <p className="text-gray-700 mb-4 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
          Join us in our journey to promote healthy eating and a greener planet.
        </p>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-8">
        {[
          { title: "Fruits Section", image: "/images/fruits.jpg" },
          { title: "Veggies Section", image: "/images/veggies.jpg" },
          { title: "All Items", image: "/images/allitems.webp" },
        ].map((section, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 border border-gray-300 rounded shadow fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out"
            style={{
              backgroundImage: `url(${section.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '200px', // Adjust height as needed
            }}
          >
            <h2 className="text-lg font-semibold text-white bg-black bg-opacity-50 p-2 rounded">{section.title}</h2>
            <Link href={`/${section.title.toLowerCase().replace(" section", "").replace(" ", "")}`} className="text-teal-600 bg-white p-2 rounded mt-2 bg-opacity-75">
              View {section.title}
            </Link>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="flex flex-col md:flex-row items-center p-4 sm:p-8">
        <div className="md:w-1/2 p-4 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-700">
            At our core, we believe in delivering the freshest produce directly from local farms to your table. Our dedicated team carefully selects fruits and vegetables, ensuring that only the highest quality products make it to our customers. We prioritize freshness, flavor, and nutrition, so you can enjoy the best nature has to offer.
            <br />
            <br />
            Sustainability is at the heart of what we do. By partnering with local farmers, we support eco-friendly practices that reduce our carbon footprint and promote biodiversity. Our commitment to sustainable sourcing means that you can feel good about your choices while enjoying delicious, wholesome foods.
            <br />
            <br />
            Customer satisfaction is our top priority. We strive to provide exceptional service, from easy online ordering to prompt delivery. Our goal is to create a seamless shopping experience that keeps you coming back for more. Choose us for an unparalleled selection of fresh produce and outstanding service that you can trust.
          </p>
        </div>
        <div className="md:w-1/2 p-4 fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out">
          <Image src="/images/picking fruits.jpg" alt="Why Choose Us" width={500} height={300} className="w-full rounded-lg shadow-lg" />
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-8">
        {customerReviews.map((customer, index) => (
          <div
            key={index}
            className="relative p-4 border border-gray-300 rounded-lg shadow-lg bg-white fade-in translate-y-8 opacity-0 transition-transform duration-500 ease-out"
          >
            <div className="absolute top-0 left-0 w-8 h-8 bg-white rounded-full shadow-lg transform -translate-x-4 -translate-y-4"></div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg transform translate-x-4 -translate-y-4"></div>
            <h3 className="font-semibold flex justify-center items-center">{customer.name}</h3>
            <p className="text-gray-600">&quot;{customer.review}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrontPage;
