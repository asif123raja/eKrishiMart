import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-teal-900 text-teal-50 py-12 mt-16 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0 px-6">
        {/* App Info */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <span className="text-white text-3xl font-extrabold tracking-wide">
            <span className="text-lime-400">Krishi</span>
            <span className="text-white">Mart</span>
          </span>
          <p className="text-teal-200 text-sm mt-3 max-w-xs">Your premium go-to marketplace for fresh, organic vegetables and more.</p>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex items-center space-x-2">
            <FaPhoneAlt />
            <span>+1 (234) 567-8901</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope />
            <span>support@krishimart.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaPhoneAlt />
            <span>+1 (987) 654-3210</span>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center md:justify-end space-x-6 mt-4 md:mt-0">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 hover:scale-125 hover:-translate-y-1 transition-all duration-300">
            <FaFacebook size={26} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 hover:scale-125 hover:-translate-y-1 transition-all duration-300">
            <FaTwitter size={26} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 hover:scale-125 hover:-translate-y-1 transition-all duration-300">
            <FaInstagram size={26} />
          </a>
        </div>
      </div>

      {/* Contributors Section */}
      <div className="mt-6 text-center border-t border-white pt-4">
        <h4 className="text-sm font-semibold">Contributors:</h4>
        <div className="flex justify-center space-x-2">
          <span className="text-sm">Md Asiful Ameen</span>
          <span className="text-sm">& Teams</span>
          
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-4 text-center text-sm border-t border-white pt-4">
        © 2024 Krishi Mart. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
