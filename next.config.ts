// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     domains: ['res.cloudinary.com'],  // Add Cloudinary here
//   },
//   /* config options here */
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows all domains
      },
      {
        protocol: "http",
        hostname: "**", // optional, in case some images are served over http
      },
    ],
  },
};

export default nextConfig;
