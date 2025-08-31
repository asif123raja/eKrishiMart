"use client";
import { useState } from 'react';
// 1. REMOVE useRouter from 'next/navigation' as the context will handle it.
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/authContext'; // ✅ 2. Import useAuth

export default function LoginPage() {
    // 3. Get the login function from the context
    const { login } = useAuth(); 

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);


    // ✅ 1. Add state to hold the verification error message.
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        // ✅ 2. Clear the error when the user types again for better UX.
        if (verificationError) {
            setVerificationError(null);
        }

        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            // ✅ 3. Check for the specific 403 status from the API.
            if (response.status === 403) {
                setVerificationError(data.error || "Please verify your email.");
                // Stop the function here.
                return; 
            }

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Login failed");
            }


            

            // ✅ 4. Use the context's login function!
            // This will handle the state update AND the navigation correctly.
            if (data.redirectPath) {
                await login(data.redirectPath);
            } else {
                console.error("No redirect path received from server.");
                // Fallback if needed
                await login('/'); 
            }

            // ❌ 5. REMOVE the old logic. The context handles it now.
            // toast.success("Login successful!");
            // if (typeof window !== "undefined") { ... }
            // router.push(data.redirectPath);

        } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred during login.");
        }
    } finally {
      setLoading(false);
    }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Access your buyer, seller, or manager dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Your form inputs remain the same... */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email" name="email" type="email" required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password" name="password" type="password" required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                value={formData.password} onChange={handleChange}
                            />
                        </div>
                        
                        {/* ... rest of your form JSX */}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        {/* ✅ 4. Conditionally render the error message here. */}
                        {verificationError && (
                            <p className="mt-2 text-center text-sm text-red-600">
                                {verificationError}
                            </p>
                        )}

                    </form>

                    <div className="mt-6">
                        {/* ... your signup links JSX */}
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                New to Krishimart?
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link href="/buyer/signup">
                                <button className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Register as Buyer
                                </button>
                            </Link>
                            <Link href="/seller/signup">
                                <button className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Register as Seller
                                </button>
                            </Link>
                        </div>
                        <div className="text-sm text-center mt-4">
                            <Link href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}