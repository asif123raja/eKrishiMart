"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast.loading("Sending reset link...");

        try {
            const res = await fetch('/api/seller/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await res.json();
            toast.dismiss();
            
            if (!res.ok) throw new Error(result.error);
            
            toast.success(result.message);
            
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Your Password?</h2>
                <p className="text-center text-gray-600 mb-6">Enter your email address and we will send you a link to reset your password.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        required
                        className="w-full px-4 py-2 border rounded-md mb-4"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}