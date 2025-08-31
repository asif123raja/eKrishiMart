// "use client";

// import axios from 'axios';
// import Link from 'next/link';
// import React, { useEffect, useState } from 'react';

// export default function VerifyEmailPage() {
//     const [token, setToken] = useState("");
//     const [verified, setVerified] = useState(false);
//     const [error, setError] = useState(false);
//     const [loading, setLoading] = useState(true);

//     const verifyUserEmail = async () => {
//         try {
//             await axios.post('/api/seller/verifyEmail', { token });
//             setVerified(true);
//             setError(false);
//         } catch (error: unknown) {
//             setError(true);
//             if (error instanceof Error) {
//                 console.error("Verification failed:", (error as any).response?.data || error.message);
//             } else {
//                 console.error("An unknown error occurred during verification");
//             }
//         } finally {
//             setLoading(false);
//         }

//     };

//     useEffect(() => {
//         const urlToken = window.location.search.split("=")[1];
//         console.log("TOKEN FROM URL:", urlToken); 
//         setToken(urlToken || "");
//     }, []);

//     useEffect(() => {
//         if (token.length > 0) {
//             verifyUserEmail();
//         } else {
//             setLoading(false);
//         }
//     // ✅ 4. Add the memoized function to the dependency array
//     }, [token, verifyUserEmail]);

//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
//             <div className="p-8 bg-white rounded-lg shadow-md text-center">
//                 <h1 className="text-2xl font-bold mb-4 text-green-800">Email Verification</h1>
                
//                 {loading && <p className="text-gray-600">Verifying your email...</p>}
                
//                 {verified && (
//                     <div>
//                         <h2 className="text-xl text-green-600 mb-4">Email Verified Successfully! ✅</h2>
//                         <Link href="/login" className="text-blue-500 hover:underline">
//                             You can now proceed to login.
//                         </Link>
//                     </div>
//                 )}
                
//                 {error && (
//                      <div>
//                         <h2 className="text-xl text-red-600">Verification Failed ❌</h2>
//                         <p className="text-gray-600 mt-2">The link may be invalid or expired.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
"use client";

import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';

export default function VerifyEmailPage() {
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const verifyUserEmail = useCallback(async () => {
        try {
            await axios.post('/api/seller/verifyEmail', { token });
            setVerified(true);
            setError(false);
        } catch (error: unknown) {
            setError(true);
            if (error instanceof Error) {
                console.error("Verification failed:", (error as any).response?.data || error.message);
            } else {
                console.error("An unknown error occurred during verification");
            }
        } finally {
            setLoading(false);
        }
    }, [token]); // Add token as dependency

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        console.log("TOKEN FROM URL:", urlToken); 
        setToken(urlToken || "");
    }, []);

    useEffect(() => {
        if (token.length > 0) {
            verifyUserEmail();
        } else {
            setLoading(false);
        }
    }, [token, verifyUserEmail]); // Now verifyUserEmail is stable

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4 text-green-800">Email Verification</h1>
                
                {loading && <p className="text-gray-600">Verifying your email...</p>}
                
                {verified && (
                    <div>
                        <h2 className="text-xl text-green-600 mb-4">Email Verified Successfully! ✅</h2>
                        <Link href="/login" className="text-blue-500 hover:underline">
                            You can now proceed to login.
                        </Link>
                    </div>
                )}
                
                {error && (
                     <div>
                        <h2 className="text-xl text-red-600">Verification Failed ❌</h2>
                        <p className="text-gray-600 mt-2">The link may be invalid or expired.</p>
                    </div>
                )}
            </div>
        </div>
    );
}