"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!");
        }
        setLoading(true);
        try {
            const res = await fetch('/api/seller/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            toast.success("Password reset successfully! You can now log in.");
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
                <form onSubmit={handleSubmit}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required className="w-full px-4 py-2 border rounded-md mb-4"/>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full px-4 py-2 border rounded-md mb-4"/>
                    <button type="submit" disabled={loading || !token} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}