"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BuyerSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        state: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
            toast.error("Invalid pincode (6 digits required)");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/buyer/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    pincode: formData.pincode,
                    city: formData.city,
                    ...(formData.addressLine1 && { addressLine1: formData.addressLine1 }),
                    ...(formData.addressLine2 && { addressLine2: formData.addressLine2 }),
                    ...(formData.state && { state: formData.state })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            toast.success("Account created successfully!");
            router.push('/login');
            
        } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred during signup.");
        }
    } finally {
      setLoading(false);
    }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create Buyer Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our platform to source fresh produce
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-black">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Required Fields */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Full Name *
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
                                Email *
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
                                Password *
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
                                Confirm Password *
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

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                City *
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
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                                Pincode *
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

                        {/* Optional Address Fields */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Address Information (Optional)</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                                        Address Line 1
                                    </label>
                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                        placeholder="Street address, P.O. Box"
                                    />
                                </div>

                                <div>
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
                                        placeholder="Apartment, suite, unit, etc."
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
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}