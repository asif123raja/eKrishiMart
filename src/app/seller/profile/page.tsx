"use client";
import Link from 'next/link'; 
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaUser, FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";

// Define a type for the seller data for better TypeScript support
type SellerProfile = {
  username: string;
  businessName: string;
  email: string;
  contactNumber: string;
  gstNumber: string;
  subscriptionPlan: string;
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
};

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    contactNumber: '', 
    businessAddress: { 
      addressLine1: '', 
      addressLine2: '', 
      city: '', 
      state: '', 
      pincode: '' 
    },
    paymentDetails: { 
      bankName: '', 
      accountNumber: '', 
      ifscCode: '', 
      upiId: '' 
    } 
  });

  // Fetch seller data on component mount
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/seller/profile');
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        setSeller(result.data);
        setFormData({ // Initialize form data
          contactNumber: result.data.contactNumber,
          businessAddress: result.data.businessAddress,
          paymentDetails: result.data.paymentDetails || { bankName: '', accountNumber: '', ifscCode: '', upiId: '' },
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Check if the field belongs to businessAddress
    if (name in formData.businessAddress) {
      setFormData(prev => ({
        ...prev,
        businessAddress: { ...prev.businessAddress, [name]: value }
      }));
    } 
    // Check if the field belongs to paymentDetails
    else if (name in formData.paymentDetails) {
      setFormData(prev => ({
        ...prev,
        paymentDetails: { ...prev.paymentDetails, [name]: value }
      }));
    } 
    // Handle top-level fields
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    toast.loading("Saving changes...");
    try {
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      toast.dismiss();
      if (!res.ok) throw new Error(result.error);
      
      setSeller(result.data); // Update main state with new data
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    }
  };

  if (loading) return <div className="text-center p-10">Loading profile...</div>;
  if (!seller) return <div className="text-center p-10 text-red-500">Could not load seller profile.</div>;

  return (
    <div className="min-h-screen bg-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 sm:mb-0 sm:mr-6">
              {seller.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">{seller.username}</h1>
              <p className="text-gray-600 text-center sm:text-left">{seller.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Business Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Business Name:</strong> {seller.businessName}</p>
                <p><strong>GST Number:</strong> {seller.gstNumber}</p>
                <div className="flex items-center justify-between">
                  <p><strong>Subscription:</strong> <span className="capitalize bg-green-100 text-green-800 px-2 py-1 rounded-full">{seller.subscriptionPlan}</span></p>
                  {seller.subscriptionPlan !== 'enterprise' && (
                    <Link href="/seller/subscriptions">
                      <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
                        Upgrade Plan
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Address (Editable Section) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-700">Contact & Address</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
              
              {isEditing ? (
                // --- EDIT MODE ---
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="font-bold">Contact Number:</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="font-bold">Address Line 1:</label>
                    <input type="text" name="addressLine1" value={formData.businessAddress.addressLine1} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="font-bold">Address Line 2:</label>
                    <input type="text" name="addressLine2" value={formData.businessAddress.addressLine2} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold">City:</label>
                      <input type="text" name="city" value={formData.businessAddress.city} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="font-bold">State:</label>
                      <input type="text" name="state" value={formData.businessAddress.state} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold">Pincode:</label>
                    <input type="text" name="pincode" value={formData.businessAddress.pincode} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                </div>
              ) : (
                // --- VIEW MODE ---
                <div className="space-y-2 text-sm">
                  <p><strong>Contact Number:</strong> {seller.contactNumber}</p>
                  <div>
                    <p className="font-bold">Address:</p>
                    <p>{seller.businessAddress.addressLine1}, {seller.businessAddress.addressLine2}</p>
                    <p>{seller.businessAddress.city}, {seller.businessAddress.state} - {seller.businessAddress.pincode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details (Editable) */}
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-700">Payment Details</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
                    <FaEdit /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                // --- EDIT MODE ---
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold">Bank Name:</label>
                      <input type="text" name="bankName" value={formData.paymentDetails.bankName} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="font-bold">Account Number:</label>
                      <input type="text" name="accountNumber" value={formData.paymentDetails.accountNumber} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="font-bold">IFSC Code:</label>
                      <input type="text" name="ifscCode" value={formData.paymentDetails.ifscCode} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="font-bold">UPI ID:</label>
                      <input type="text" name="upiId" value={formData.paymentDetails.upiId} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                  </div>
                </div>
              ) : (
                // --- VIEW MODE ---
                <div className="space-y-2 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Bank Name:</strong> {seller.paymentDetails?.bankName || 'N/A'}</p>
                  <p><strong>Account Number:</strong> {seller.paymentDetails?.accountNumber || 'N/A'}</p>
                  <p><strong>IFSC Code:</strong> {seller.paymentDetails?.ifscCode || 'N/A'}</p>
                  <p><strong>UPI ID:</strong> {seller.paymentDetails?.upiId || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons (only show when editing) */}
          {isEditing && (
            <div className="flex gap-2 mt-6 justify-end">
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-1">
                <FaSave /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center gap-1">
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}