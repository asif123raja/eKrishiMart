"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        contactNumber: '',
        gstNumber: '',
        fssaiLicense: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        businessType: 'farmer'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
        console.log("password issues");
        toast.error("Passwords don't match!");
        return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
        console.log("Invalid pincode (6 digits required)");
        toast.error("Invalid pincode (6 digits required)");
        return;
    }

    try {
        setLoading(true);
        const response = await fetch('/api/seller/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                businessName: formData.businessName,
                contactNumber: formData.contactNumber,
                gstNumber: formData.gstNumber,
                fssaiLicense: formData.fssaiLicense,
                businessAddress: {
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.addressLine2 || '', // Handle optional field
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                pincode: formData.pincode // The API expects this at root level too
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Signup failed");
        }

        toast.success("Account created! Please check your email to verify.");
        router.push('/login');
        
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
                    Register as Seller
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    For farmers, distributors, and wholesale suppliers
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details Column */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Business Details Column */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                                
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                                        Business/Farm Name
                                    </label>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                                        Business Type
                                    </label>
                                    <select
                                        id="businessType"
                                        name="businessType"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                    >
                                        <option value="farmer">Farmer/Producer</option>
                                        <option value="distributor">Distributor</option>
                                        <option value="wholesaler">Wholesaler</option>
                                        <option value="cooperative">Cooperative</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                                        GST Number
                                    </label>
                                    <input
                                        id="gstNumber"
                                        name="gstNumber"
                                        type="text"
                                        required
                                        pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                                        title="Enter valid GST number (e.g. 22ABCDE1234F1Z5)"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fssaiLicense" className="block text-sm font-medium text-gray-700">
                                        FSSAI License (if applicable)
                                    </label>
                                    <input
                                        id="fssaiLicense"
                                        name="fssaiLicense"
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.fssaiLicense}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                                        Contact Number
                                    </label>
                                    <input
                                        id="contactNumber"
                                        name="contactNumber"
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        title="10 digit mobile number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900">Business Address</h3>
                            
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                                        Address Line 1
                                    </label>
                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                                        Address Line 2
                                    </label>
                                    <input
                                        id="addressLine2"
                                        name="addressLine2"
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.addressLine2}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                        State
                                    </label>
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>


                                <div>
                                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                                        Pincode
                                    </label>
                                    <input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        required
                                        pattern="\d{6}"
                                        title="6 digit pincode"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>

                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}