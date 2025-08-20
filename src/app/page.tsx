// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
"use client"; // Use this directive if you're using Next.js with the App Router

import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component
import React, { useEffect } from "react";
import { FaApple, FaCarrot, FaBoxOpen } from "react-icons/fa"; // Import icons or use images as needed

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
