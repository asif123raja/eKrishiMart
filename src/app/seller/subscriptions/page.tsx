// "use client";

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/authContext'; // Assuming you have this
// import { toast } from 'react-hot-toast';
// import Script from 'next/script';
// import { FaCheckCircle } from 'react-icons/fa';

// const plans = [
//     { 
//         name: 'Basic', 
//         price: 'Free', 
//         features: ['15 Products/Month', 'Basic Support', 'Standard Analytics'] 
//     },
//     { 
//         name: 'Pro', 
//         price: '₹1000', 
//         features: ['Unlimited Products', 'Priority Support', 'Advanced Analytics', 'Marketing Tools'] 
//     },
//     { 
//         name: 'Enterprise', 
//         price: '₹3000', 
//         features: ['All Pro Features', 'Dedicated Account Manager', 'No Delivery Fees'] 
//     },
// ];

// export default function SubscriptionsPage() {
//     const { role } = useAuth(); // You might need to fetch the full seller profile
//     const [currentPlan, setCurrentPlan] = useState('basic'); // Default or fetched value
//     const [isLoading, setIsLoading] = useState(false);

//     // In a real app, you would fetch the seller's current plan here
//     // useEffect(() => { fetch seller profile and setCurrentPlan(seller.subscriptionPlan) }, []);

//     const handleUpgrade = async (targetPlan: string) => {
//         setIsLoading(true);
//         toast.loading('Preparing your upgrade...');

//         try {
//             const res = await fetch('/api/seller/subscriptions/create-order', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ targetPlan }),
//             });

//             const result = await res.json();
//             toast.dismiss();
//             if (!res.ok) throw new Error(result.error);
            
//             // Initiate Razorpay Payment
//             const { order } = result;
//             const options = {
//                 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//                 amount: order.amount,
//                 currency: "INR",
//                 name: `Upgrade to ${targetPlan} Plan`,
//                 order_id: order.id,
//                 handler: function (response: any) {
//                     toast.success("Payment successful! Your plan will be updated shortly.");
//                     // The webhook will handle the database update
//                     window.location.reload(); // Reload to reflect changes
//                 },
//                 theme: { color: "#10b981" }
//             };
//             const rzp = new (window as any).Razorpay(options);
//             rzp.open();

//         } catch (error: any) {
//             toast.dismiss();
//             toast.error(error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };
    
//     const getButtonState = (planName: string) => {
//         const planIndex = plans.findIndex(p => p.name.toLowerCase() === planName.toLowerCase());
//         const currentIndex = plans.findIndex(p => p.name.toLowerCase() === currentPlan.toLowerCase());

//         if (planIndex < currentIndex) return { text: 'Unavailable', disabled: true };
//         if (planIndex === currentIndex) return { text: 'Current Plan', disabled: true };
//         return { text: `Upgrade to ${planName}`, disabled: false };
//     };

//     return (
//         <>
//             <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
//             <div className="min-h-screen bg-gray-100 p-8">
//                 <div className="text-center">
//                     <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
//                     <p className="text-gray-600 mt-2">Unlock more features to grow your business.</p>
//                 </div>

//                 <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//                     {plans.map(plan => {
//                         const { text, disabled } = getButtonState(plan.name);
//                         return (
//                             <div key={plan.name} className={`bg-white p-6 rounded-lg shadow-lg border-2 ${currentPlan === plan.name.toLowerCase() ? 'border-green-500' : 'border-transparent'}`}>
//                                 <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
//                                 <p className="text-3xl font-bold my-4">{plan.price}<span className="text-base font-normal">{plan.name !== 'Basic' && '/month'}</span></p>
//                                 <ul className="space-y-2">
//                                     {plan.features.map(feature => (
//                                         <li key={feature} className="flex items-center">
//                                             <FaCheckCircle className="text-green-500 mr-2" />
//                                             {feature}
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <button
//                                     onClick={() => handleUpgrade(plan.name.toLowerCase())}
//                                     disabled={disabled || isLoading}
//                                     className="w-full mt-6 py-2 px-4 rounded-lg text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
//                                 >
//                                     {isLoading ? 'Processing...' : text}
//                                 </button>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </>
//     );
// }

"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Script from 'next/script';
import { FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
// --- Plan Definitions ---
const plans = [
    { 
        name: 'Basic', 
        price: 'Free', 
        features: ['15 Products/Month', 'Basic Support', 'Standard Analytics'] 
    },
    { 
        name: 'Pro', 
        price: '₹1000', 
        features: ['Unlimited Products', 'Priority Support', 'Advanced Analytics', 'Marketing Tools'] 
    },
    { 
        name: 'Enterprise', 
        price: '₹3000', 
        features: ['All Pro Features', 'Dedicated Account Manager', 'No Delivery Fees'] 
    },
];

export default function SubscriptionsPage() {
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Manages both page load and upgrade clicks
    const router = useRouter();
    // ✅ 1. Fetch the seller's current plan on page load
    useEffect(() => {
        const fetchSellerPlan = async () => {
            try {
                const res = await fetch('/api/seller/profile'); // Using the profile route we already built
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                setCurrentPlan(result.data.subscriptionPlan);
            } catch (error: any) {
                toast.error(`Failed to load profile: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellerPlan();
    }, []);

    // ✅ 2. Updated to use the client-side verification flow
    const handleUpgrade = async (targetPlan: string) => {
        setIsLoading(true);
        toast.loading('Preparing your upgrade...');

        try {
            // First, create the payment order
            const res = await fetch('/api/seller/subscriptions/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetPlan }),
            });

            const result = await res.json();
            toast.dismiss();
            if (!res.ok) throw new Error(result.error);
            
            // Initiate Razorpay Payment
            const { order } = result;
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: `Upgrade to ${targetPlan} Plan`,
                order_id: order.id,
                // The handler now calls our verification API
                handler: async (response: any) => {
                    toast.loading("Verifying your payment...");
                    try {
                        const verificationRes = await fetch('/api/seller/subscriptions/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                paymentDetails: response,
                                targetPlan: targetPlan,
                            }),
                        });

                        const verificationResult = await verificationRes.json();
                        toast.dismiss();
                        if (!verificationRes.ok) throw new Error(verificationResult.error);

                        toast.success(verificationResult.message);
                        setCurrentPlan(targetPlan); // Update UI instantly

                        // ✅ 3. Redirect to the profile page on success
                        router.push('/seller/profile');
                        
                    } catch (error: any) {
                        toast.dismiss();
                        toast.error(`Verification failed: ${error.message}`);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        toast.error("Upgrade cancelled.");
                    }
                },
                theme: { color: "#10b981" }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message);
        } finally {
            // Let the modal's ondismiss handle this for payment flow
            // setIsLoading(false);
        }
    };
    
    // This function remains the same
    const getButtonState = (planName: string) => {
        if (!currentPlan) return { text: 'Loading...', disabled: true };
        const planIndex = plans.findIndex(p => p.name.toLowerCase() === planName.toLowerCase());
        const currentIndex = plans.findIndex(p => p.name.toLowerCase() === currentPlan.toLowerCase());

        if (planIndex < currentIndex) return { text: 'Unavailable', disabled: true };
        if (planIndex === currentIndex) return { text: 'Current Plan', disabled: true };
        return { text: `Upgrade to ${planName}`, disabled: false };
    };

    if (isLoading && !currentPlan) {
        return <div className="text-center p-10">Loading plans...</div>;
    }

    return (
        <>
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
                    <p className="text-gray-600 mt-2">Unlock more features to grow your business.</p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map(plan => {
                        const { text, disabled } = getButtonState(plan.name);
                        return (
                            <div key={plan.name} className={`bg-white p-6 rounded-lg shadow-lg border-2 ${currentPlan === plan.name.toLowerCase() ? 'border-green-500' : 'border-transparent'}`}>
                                <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
                                <p className="text-3xl font-bold my-4">{plan.price}<span className="text-base font-normal">{plan.name !== 'Basic' && '/month'}</span></p>
                                <ul className="space-y-2">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center">
                                            <FaCheckCircle className="text-green-500 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleUpgrade(plan.name.toLowerCase())}
                                    disabled={disabled || isLoading}
                                    className="w-full mt-6 py-2 px-4 rounded-lg text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? 'Processing...' : text}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}