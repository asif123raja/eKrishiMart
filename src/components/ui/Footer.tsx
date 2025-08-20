import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope, FaUserFriends } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-teal-100 text-teal-950 py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* App Info */}
        <div className="text-center md:text-left">
          <span className="text-white text-3xl font-bold">
            <span className="text-purple-600">Krishi</span>
            <span className="text-gray-600">Mart</span>
          </span>
          <p className="text-sm mt-2">Your go-to marketplace for fresh vegetables and more.</p>
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
        <div className="flex justify-center md:justify-end space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
            <FaTwitter size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
            <FaInstagram size={24} />
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
