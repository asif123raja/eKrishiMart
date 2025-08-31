// 'use client';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState, useMemo } from 'react';
// import toast from 'react-hot-toast';
// import Script from 'next/script';
// import { getDataFromToken } from '@/helper/getDataFromToken';
// import { getClientAuthData } from '@/helper/clientAuth';

// // Constants
// const PLATFORM_FEE = 3;
// const INVENTORY_FEE = 5;
// const GST_RATE = 0.18;
// const MINIMUM_ORDER_VALUE = 200;

// // Types
// interface Address {
//     _id?: string;
//     addressLine1: string;
//     addressLine2?: string;
//     city: string;
//     state: string;
//     pincode: string;
//     isDefault?: boolean;
// }

// const BLANK_ADDRESS: Address = { addressLine1: '', city: '', state: '', pincode: '' };

// export default function CheckoutPage() {
//   const [cart, setCart] = useState<any[]>([]);
//   const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
//   const router = useRouter();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [addressFormData, setAddressFormData] = useState<Address>(BLANK_ADDRESS);

//   const buyerId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

//   // Load Razorpay script
//   useEffect(() => {
//     const loadRazorpay = () => {
//       return new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.async = true;
//         script.onload = () => {
//           resolve(true);
//         };
//         document.body.appendChild(script);
//       });
//     };

//     loadRazorpay();
//   }, []);

//   useEffect(() => {
//     if (!buyerId) {
//         router.push('/login');
//         return;
//     };
    
//     async function fetchData() {
//         try {
//             const [cartRes, profileRes] = await Promise.all([
//                 fetch(`/api/buyer/checkout?buyerId=${buyerId}`),
//                 fetch(`/api/buyer/profile`)
//             ]);

//             const cartData = await cartRes.json();
//             const profileData = await profileRes.json();
            
//             if (cartData.cart) setCart(cartData.cart);
//             if (profileData.user?.shippingAddresses) {
//                 setShippingAddresses(profileData.user.shippingAddresses);
//                 const defaultAddress = profileData.user.shippingAddresses.find((addr: any) => addr.isDefault);
//                 if (defaultAddress) setSelectedAddress(defaultAddress);
//             }
//         } catch (err) {
//             toast.error("Failed to load checkout data");
//         } finally {
//             setLoading(false);
//         }
//     }
//     fetchData();
//   }, [buyerId, router]);

//   const openAddressModal = (address: Address | null = null) => {
//     setAddressFormData(address || BLANK_ADDRESS);
//     setIsModalOpen(true);
//   };

//   const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setAddressFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSaveAddress = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//         const isEditing = !!addressFormData._id;
//         const url = '/api/buyer/addresses';
//         const method = isEditing ? 'PUT' : 'POST';

//         const payload = {
//             ...addressFormData,
//             buyerId
//         };

//         const res = await fetch(url, {
//             method,
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//         });

//         if (!res.ok) throw new Error(await res.text());

//         const data = await res.json();
//         setShippingAddresses(data.shippingAddresses);
//         setIsModalOpen(false);
//         toast.success(`Address ${isEditing ? 'updated' : 'added'}!`);
        
//         if (shippingAddresses.length === 0) {
//             setSelectedAddress(data.shippingAddresses[0]);
//         }
//     } catch (err: any) {
//         toast.error(err.message || "Failed to save address");
//     }
//   };

//   const getPriceForQuantity = (item: any): number => {
//     const { quantity, productId } = item;
//     if (!productId || !productId.pricing) return 0;
    
//     const { pricing } = productId;
//     let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

//     if (pricing.bulkPricing && Array.isArray(pricing.bulkPricing)) {
//       const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
//       for (const bulk of sortedTiers) {
//         if (quantity >= bulk.minQuantity) {
//           applicablePrice = bulk.price;
//           break;
//         }
//       }
//     }
//     return applicablePrice;
//   };

//   const totals = useMemo(() => {
//     if (cart.length === 0) return null;
    
//     const subtotal = cart.reduce((total, item) => {
//         const price = getPriceForQuantity(item);
//         return total + price * item.quantity;
//     }, 0);

//     let deliveryCharge = 0;
//     if (subtotal >= MINIMUM_ORDER_VALUE) {
//         if (subtotal <= 400) deliveryCharge = 40;
//         else if (subtotal <= 800) deliveryCharge = 60;
//         else if (subtotal <= 1000) deliveryCharge = 70;
//         else if (subtotal <= 5000) deliveryCharge = 100;
//         else if (subtotal <= 20000) deliveryCharge = 150;
//         else deliveryCharge = 300;
//     }
//     const totalFees = PLATFORM_FEE + INVENTORY_FEE + deliveryCharge;
//     const gstOnFees = totalFees * GST_RATE;
//     const grandTotal = subtotal + totalFees + gstOnFees;
//     return { subtotal, platformFee: PLATFORM_FEE, inventoryFee: INVENTORY_FEE, deliveryCharge, gstOnFees, grandTotal };
//   }, [cart]);

// // Place this function inside your 'CheckoutPage' component

// const handleOnlinePayment = async () => {
//   if (!selectedAddress) {
//     toast.error("Please select a shipping address.");
//     return;
//   }
//   setLoading(true);
//   try {
//     const buyerId = sessionStorage.getItem('userId');
//     if (!buyerId) throw new Error('Please log in to continue');
//     if (!totals) {
//       throw new Error('Cannot calculate order total');
//     }
//     // Step 1: Create a Razorpay order on your server
//     const orderRes = await fetch('/api/payment/create-razorpay-order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         amount: Math.round(totals.grandTotal * 100), // Amount in paise
//         currency: 'INR',
//         buyerId: buyerId,
//       }),
//     });

//     if (!orderRes.ok) {
//         const errorData = await orderRes.json();
//         throw new Error(errorData.error || 'Failed to create payment order');
//     }
//     const { id: razorpayOrderId, amount, currency } = await orderRes.json();

//     // Step 2: Configure and open the Razorpay payment widget
//     const options = {
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       amount: amount,
//       currency: currency,
//       name: 'KrishiMart',
//       description: 'Order Payment',
//       order_id: razorpayOrderId,
//       // This handler function is called after a successful payment
//       handler: async (response: any) => {
//         try {
//           // Step 3: Send payment details to your server for verification
//           const verificationRes = await fetch('/api/payment/verify-rezorpay-payment', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature,
//               shippingAddress: selectedAddress,
//             }),
//           });
          
//           if (!verificationRes.ok) {
//             const errorData = await verificationRes.json();
//             throw new Error(errorData.error || 'Payment verification failed');
//           }

//           const { orderId } = await verificationRes.json();
//           toast.success('Payment successful! Your order has been placed.');
//           router.push(`/buyer/orders/${orderId}`); // Redirect to order success page

//         } catch (err: any) {
//           toast.error(err.message);
//         }
//       },
//       prefill: {
//         // You can prefill the user's name, email, and contact here
//       },
//       modal: {
//         ondismiss: () => {
//           toast.error('Payment window closed.');
//           setLoading(false);
//         },
//       }
//     };

//     const rzp = new (window as any).Razorpay(options);
//     rzp.open();

//   } catch (err: any) {
//     toast.error(err.message);
//     setLoading(false);
//   }
// };

// const handlePlaceOrder = async () => {
//   if (!selectedAddress || !selectedAddress.addressLine1 || 
//       !selectedAddress.city || !selectedAddress.state || !selectedAddress.pincode) {
//     toast.error("Please provide complete shipping address");
//     return;
//   }

//   if (!cart.length) {
//     toast.error("Your cart is empty");
//     return;
//   }

//   setLoading(true);

//   try {
//     // For online payments
//     if (paymentMethod === 'online') {
//       return await handleOnlinePayment();
//     }

//     // For COD payments
//     const response = await fetch('/api/buyer/orders', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         shippingAddress: {
//           addressLine1: selectedAddress.addressLine1,
//           addressLine2: selectedAddress.addressLine2 || '',
//           city: selectedAddress.city,
//           state: selectedAddress.state,
//           pincode: selectedAddress.pincode
//         },
//         paymentMethod: 'cod'
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Order failed');
//     }

//     const { orderId, deliveryPasscode } = await response.json();
    
//     // Store passcode and clear cart
//     sessionStorage.setItem(`order_${orderId}_passcode`, deliveryPasscode);
//     setCart([]);
    
//     toast.success("Order placed successfully!");
//     router.push(`/orders/${orderId}`);

//   } catch (error: any) {
//     console.error('Order error:', error);
//     toast.error(
//       error.message.includes('network') ? 'Network error' :
//       error.message.includes('stock') ? error.message :
//       'Failed to place order'
//     );
//   } finally {
//     setLoading(false);
//   }
// };

// const validateInputs = () => {
//   if (!selectedAddress?.addressLine1 || !selectedAddress?.city || 
//       !selectedAddress?.state || !selectedAddress?.pincode) {
//     toast.error("Please provide complete shipping address");
//     return false;
//   }
//   if (!cart.length) {
//     toast.error("Your cart is empty");
//     return false;
//   }
//   return true;
// };

// interface Address {
//   addressLine1: string;
//   addressLine2?: string;
//   city: string;
//   state: string;
//   pincode: string;
// }

// const formatAddress = (address: Address) => ({
//   addressLine1: address.addressLine1,
//   addressLine2: address.addressLine2 || '',
//   city: address.city,
//   state: address.state,
//   pincode: address.pincode
// });
// const handleResponse = async (response: Response) => {
//   const data = await response.json();
  
//   if (!response.ok) {
//     if (response.status === 401) router.push('/login');
//     throw new Error(data.message || 'Order failed');
//   }

//   if (!data.success || !data.orderId) {
//     throw new Error("Invalid response from server");
//   }

//   toast.success("Order placed successfully!");
//   setCart([]);
  
//   if (data.deliveryPasscode) {
//     sessionStorage.setItem(`order_${data.orderId}_passcode`, data.deliveryPasscode);
//   }
  
//   router.push(`/buyer/orders/${data.orderId}`);
// };

// const handleError = (error) => {
//   console.error('Order error:', error);
//   let message = error.message || 'Failed to place order';
  
//   if (error.message.includes('network')) message = 'Network error';
//   else if (error.message.includes('expired')) message = 'Session expired';
//   else if (error.message.includes('stock')) message = error.message;
  
//   toast.error(message);
// };

//   if (loading) return <p>Loading Checkout...</p>;
//   if (!cart.length || !totals) return <p>Your cart is empty. Nothing to checkout.</p>;

//   return (
//     <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
//       <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      
//       {/* Left side: Address and Payment */}
//       <div className="md:col-span-2">
//         <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        
//         {/* Address Selection */}
//         <div className="bg-white p-4 rounded shadow-sm mb-6">
//             <div className="flex justify-between items-center mb-2">
//                 <h2 className="text-xl font-semibold">Shipping Address</h2>
//                 <button 
//                     onClick={() => openAddressModal()}
//                     className="text-blue-600 hover:text-blue-800 text-sm"
//                 >
//                     + Add New Address
//                 </button>
//             </div>
            
//             {shippingAddresses.length > 0 ? (
//                 <div className="space-y-3">
//                     {shippingAddresses.map((addr) => (
//                         <div
//                             key={addr._id || `${addr.addressLine1}-${addr.pincode}`}
//                             className={`p-4 border rounded cursor-pointer transition-colors ${
//                                 selectedAddress?._id === addr._id 
//                                     ? 'border-blue-500 bg-blue-50' 
//                                     : 'hover:bg-gray-50'
//                             }`}
//                             onClick={() => setSelectedAddress(addr)}
//                         >
//                             <p className="font-medium">{addr.addressLine1}</p>
//                             {addr.addressLine2 && <p>{addr.addressLine2}</p>}
//                             <p>{addr.city}, {addr.state} - {addr.pincode}</p>
//                             {addr.isDefault && (
//                                 <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
//                                     Default
//                                 </span>
//                             )}
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     openAddressModal(addr);
//                                 }}
//                                 className="mt-2 text-sm text-blue-600 hover:text-blue-800"
//                             >
//                                 Edit
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="text-center py-6">
//                     <p className="text-gray-500 mb-4">No saved addresses found</p>
//                     <button
//                         onClick={() => openAddressModal()}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                         Add Your First Address
//                     </button>
//                 </div>
//             )}
//         </div>
        
//         {/* Payment Method */}
//         <div className="bg-white p-4 rounded shadow-sm">
//             <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
//             <div className="space-y-3">
//                 <div className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
//                     paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''
//                 }`} onClick={() => setPaymentMethod('cod')}>
//                     <input
//                         type="radio"
//                         id="cod"
//                         name="payment"
//                         checked={paymentMethod === 'cod'}
//                         onChange={() => {}}
//                         className="h-4 w-4"
//                     />
//                     <label htmlFor="cod" className="flex-1 cursor-pointer">
//                         <span className="font-medium">Cash on Delivery</span>
//                         <p className="text-sm text-gray-500">Pay when you receive your order</p>
//                     </label>
//                 </div>

//                 <div className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
//                     paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : ''
//                 }`} onClick={() => setPaymentMethod('online')}>
//                     <input
//                         type="radio"
//                         id="online"
//                         name="payment"
//                         checked={paymentMethod === 'online'}
//                         onChange={() => {}}
//                         className="h-4 w-4"
//                     />
//                     <label htmlFor="online" className="flex-1 cursor-pointer">
//                         <span className="font-medium">Pay Online</span>
//                         <p className="text-sm text-gray-500">Credit/Debit Card, UPI, NetBanking, Wallets</p>
//                         <div className="flex gap-2 mt-1">
//                         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" alt="Visa" className="h-6" />
//                         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" alt="Mastercard" className="h-6" />
//                         <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg" alt="Rupay" className="h-6" />
//                         <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
//                         </div>
//                     </label>
//                 </div>
//             </div>
//         </div>
//       </div>

//       {/* Right side: Order Summary */}
//       <div className="md:col-span-1">
//         <div className="bg-white p-4 rounded shadow-sm sticky top-4">
//           <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
//             <div className="space-y-2">
//                 <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
//                 <div className="flex justify-between"><span>Platform Fee</span><span>₹{totals.platformFee.toFixed(2)}</span></div>
//                 <div className="flex justify-between"><span>Inventory Fee</span><span>₹{totals.inventoryFee.toFixed(2)}</span></div>
//                 <div className="flex justify-between"><span>Delivery Charge</span><span>₹{totals.deliveryCharge.toFixed(2)}</span></div>
//                 <div className="flex justify-between text-sm text-gray-600 border-b pb-2"><span>GST (18%)</span><span>₹{totals.gstOnFees.toFixed(2)}</span></div>
//                 <div className="flex justify-between text-xl font-bold pt-2"><span>Grand Total</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
//             </div>
//             <button
//                 onClick={handlePlaceOrder}
//                 disabled={loading || !selectedAddress}
//                 className={`w-full mt-6 px-6 py-3 text-white font-bold rounded ${
//                     loading || !selectedAddress
//                         ? 'bg-gray-400 cursor-not-allowed'
//                         : 'bg-green-600 hover:bg-green-700'
//                 }`}
//             >
//                 {loading 
//                     ? paymentMethod === 'online' 
//                         ? 'Processing Payment...' 
//                         : 'Placing Order...'
//                     : paymentMethod === 'online'
//                         ? 'Pay Now'
//                         : 'Place Order'
//                 }
//             </button>
//         </div>
//       </div>
      
//       {/* Address Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
//             <h2 className="text-2xl font-bold mb-4">
//                 {addressFormData._id ? 'Edit Address' : 'Add New Address'}
//             </h2>
//             <form onSubmit={handleSaveAddress}>
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
//                         <input
//                             type="text"
//                             name="addressLine1"
//                             value={addressFormData.addressLine1}
//                             onChange={handleAddressFormChange}
//                             placeholder="Street address"
//                             required
//                             className="w-full p-2 border rounded"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
//                         <input
//                             type="text"
//                             name="addressLine2"
//                             value={addressFormData.addressLine2 || ''}
//                             onChange={handleAddressFormChange}
//                             placeholder="Apartment, suite, etc."
//                             className="w-full p-2 border rounded"
//                         />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
//                             <input
//                                 type="text"
//                                 name="city"
//                                 value={addressFormData.city}
//                                 onChange={handleAddressFormChange}
//                                 placeholder="City"
//                                 required
//                                 className="w-full p-2 border rounded"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
//                             <input
//                                 type="text"
//                                 name="state"
//                                 value={addressFormData.state}
//                                 onChange={handleAddressFormChange}
//                                 placeholder="State"
//                                 required
//                                 className="w-full p-2 border rounded"
//                             />
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
//                         <input
//                             type="text"
//                             name="pincode"
//                             value={addressFormData.pincode}
//                             onChange={handleAddressFormChange}
//                             placeholder="6-digit pincode"
//                             required
//                             pattern="\d{6}"
//                             className="w-full p-2 border rounded"
//                         />
//                     </div>
//                     <div className="flex items-center">
//                         <input
//                             type="checkbox"
//                             id="defaultAddress"
//                             name="isDefault"
//                             checked={addressFormData.isDefault || false}
//                             onChange={(e) => setAddressFormData(prev => ({
//                                 ...prev,
//                                 isDefault: e.target.checked
//                             }))}
//                             className="h-4 w-4"
//                         />
//                         <label htmlFor="defaultAddress" className="ml-2 text-sm text-gray-700">
//                             Set as default address
//                         </label>
//                     </div>
//                 </div>
//                 <div className="mt-6 flex justify-end gap-4">
//                     <button
//                         type="button"
//                         onClick={() => setIsModalOpen(false)}
//                         className="px-4 py-2 border rounded hover:bg-gray-100"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                         Save Address
//                     </button>
//                 </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import Image from 'next/image';

// Constants
const PLATFORM_FEE = 3;
const INVENTORY_FEE = 5;
const GST_RATE = 0.18;
const MINIMUM_ORDER_VALUE = 200;

// Types
interface Address {
    _id?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

interface CartItem {
    _id: string;
    quantity: number;
    productId: {
        _id: string;
        name: string;
        pricing: {
            basePrice: number;
            discountedPrice?: number;
            bulkPricing?: Array<{
                minQuantity: number;
                price: number;
            }>;
        };
    };
}

interface Totals {
    subtotal: number;
    platformFee: number;
    inventoryFee: number;
    deliveryCharge: number;
    gstOnFees: number;
    grandTotal: number;
}

interface RazorpayOptions {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: object;
    modal: {
        ondismiss: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
        };
    }
}

const BLANK_ADDRESS: Address = { addressLine1: '', city: '', state: '', pincode: '' };

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState<Address>(BLANK_ADDRESS);

  const buyerId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          resolve(true);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  useEffect(() => {
    if (!buyerId) {
        router.push('/login');
        return;
    };
    
    async function fetchData() {
        try {
            const [cartRes, profileRes] = await Promise.all([
                fetch(`/api/buyer/checkout?buyerId=${buyerId}`),
                fetch(`/api/buyer/profile`)
            ]);

            const cartData = await cartRes.json();
            const profileData = await profileRes.json();
            
            if (cartData.cart) setCart(cartData.cart);
            if (profileData.user?.shippingAddresses) {
                setShippingAddresses(profileData.user.shippingAddresses);
                const defaultAddress = profileData.user.shippingAddresses.find((addr: Address) => addr.isDefault);
                if (defaultAddress) setSelectedAddress(defaultAddress);
            }
        } catch (error) {
            toast.error("Failed to load checkout data");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [buyerId, router]);

  const openAddressModal = (address: Address | null = null) => {
    setAddressFormData(address || BLANK_ADDRESS);
    setIsModalOpen(true);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const isEditing = !!addressFormData._id;
        const url = '/api/buyer/addresses';
        const method = isEditing ? 'PUT' : 'POST';

        const payload = {
            ...addressFormData,
            buyerId
        };

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to save address');

        const data = await res.json();
        setShippingAddresses(data.shippingAddresses);
        setIsModalOpen(false);
        toast.success(`Address ${isEditing ? 'updated' : 'added'}!`);
        
        if (shippingAddresses.length === 0) {
            setSelectedAddress(data.shippingAddresses[0]);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save address";
        toast.error(errorMessage);
    }
  };

  const getPriceForQuantity = (item: CartItem): number => {
    const { quantity, productId } = item;
    if (!productId || !productId.pricing) return 0;
    
    const { pricing } = productId;
    let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

    if (pricing.bulkPricing && Array.isArray(pricing.bulkPricing)) {
      const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const bulk of sortedTiers) {
        if (quantity >= bulk.minQuantity) {
          applicablePrice = bulk.price;
          break;
        }
      }
    }
    return applicablePrice;
  };

  const totals = useMemo(() => {
    if (cart.length === 0) return null;
    
    const subtotal = cart.reduce((total, item) => {
        const price = getPriceForQuantity(item);
        return total + price * item.quantity;
    }, 0);

    let deliveryCharge = 0;
    if (subtotal >= MINIMUM_ORDER_VALUE) {
        if (subtotal <= 400) deliveryCharge = 40;
        else if (subtotal <= 800) deliveryCharge = 60;
        else if (subtotal <= 1000) deliveryCharge = 70;
        else if (subtotal <= 5000) deliveryCharge = 100;
        else if (subtotal <= 20000) deliveryCharge = 150;
        else deliveryCharge = 300;
    }
    const totalFees = PLATFORM_FEE + INVENTORY_FEE + deliveryCharge;
    const gstOnFees = totalFees * GST_RATE;
    const grandTotal = subtotal + totalFees + gstOnFees;
    
    return { subtotal, platformFee: PLATFORM_FEE, inventoryFee: INVENTORY_FEE, deliveryCharge, gstOnFees, grandTotal };
  }, [cart]);

  const handleOnlinePayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    setLoading(true);
    try {
      const buyerId = sessionStorage.getItem('userId');
      if (!buyerId) throw new Error('Please log in to continue');
      if (!totals) {
        throw new Error('Cannot calculate order total');
      }
      
      // Step 1: Create a Razorpay order on your server
      const orderRes = await fetch('/api/payment/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totals.grandTotal * 100), // Amount in paise
          currency: 'INR',
          buyerId: buyerId,
        }),
      });

      if (!orderRes.ok) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || 'Failed to create payment order');
      }
      const { id: razorpayOrderId, amount, currency } = await orderRes.json();

      // Step 2: Configure and open the Razorpay payment widget
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'KrishiMart',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        // This handler function is called after a successful payment
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 3: Send payment details to your server for verification
            const verificationRes = await fetch('/api/payment/verify-rezorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: selectedAddress,
              }),
            });
            
            if (!verificationRes.ok) {
              const errorData = await verificationRes.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            const { orderId } = await verificationRes.json();
            toast.success('Payment successful! Your order has been placed.');
            router.push(`/buyer/orders/${orderId}`); // Redirect to order success page

          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            toast.error(errorMessage);
          }
        },
        prefill: {
          // You can prefill the user's name, email, and contact here
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment window closed.');
            setLoading(false);
          },
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedAddress.addressLine1 || 
        !selectedAddress.city || !selectedAddress.state || !selectedAddress.pincode) {
      toast.error("Please provide complete shipping address");
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // For online payments
      if (paymentMethod === 'online') {
        return await handleOnlinePayment();
      }

      // For COD payments
      const response = await fetch('/api/buyer/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode
          },
          paymentMethod: 'cod'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Order failed');
      }

      const { orderId, deliveryPasscode } = await response.json();
      
      // Store passcode and clear cart
      sessionStorage.setItem(`order_${orderId}_passcode`, deliveryPasscode);
      setCart([]);
      
      toast.success("Order placed successfully!");
      router.push(`/orders/${orderId}`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      
      if (errorMessage.includes('network')) {
        toast.error('Network error');
      } else if (errorMessage.includes('stock')) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading Checkout...</p>;
  if (!cart.length || !totals) return <p>Your cart is empty. Nothing to checkout.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      
      {/* Left side: Address and Payment */}
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        
        {/* Address Selection */}
        <div className="bg-white p-4 rounded shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <button 
                    onClick={() => openAddressModal()}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    + Add New Address
                </button>
            </div>
            
            {shippingAddresses.length > 0 ? (
                <div className="space-y-3">
                    {shippingAddresses.map((addr) => (
                        <div
                            key={addr._id || `${addr.addressLine1}-${addr.pincode}`}
                            className={`p-4 border rounded cursor-pointer transition-colors ${
                                selectedAddress?._id === addr._id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedAddress(addr)}
                        >
                            <p className="font-medium">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            {addr.isDefault && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                    Default
                                </span>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openAddressModal(addr);
                                }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No saved addresses found</p>
                    <button
                        onClick={() => openAddressModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Your First Address
                    </button>
                </div>
            )}
        </div>
        
        {/* Payment Method */}
        <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
            <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''
                }`} onClick={() => setPaymentMethod('cod')}>
                    <input
                        type="radio"
                        id="cod"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => {}}
                        className="h-4 w-4"
                    />
                    <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </label>
                </div>

                <div className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                    paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : ''
                }`} onClick={() => setPaymentMethod('online')}>
                    <input
                        type="radio"
                        id="online"
                        name="payment"
                        checked={paymentMethod === 'online'}
                        onChange={() => {}}
                        className="h-4 w-4"
                    />
                    <label htmlFor="online" className="flex-1 cursor-pointer">
                        <span className="font-medium">Pay Online</span>
                        <p className="text-sm text-gray-500">Credit/Debit Card, UPI, NetBanking, Wallets</p>
                        <div className="flex gap-2 mt-1">
                          <Image src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" alt="Visa" width={24} height={24} />
                          <Image src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" alt="Mastercard" width={24} height={24} />
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg" alt="Rupay" width={24} height={24} />
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/e/eb/UPI-Logo-vector.svg" alt="UPI" width={24} height={24} />
                        </div>
                    </label>
                </div>
            </div>
        </div>
      </div>

      {/* Right side: Order Summary */}
      <div className="md:col-span-1">
        <div className="bg-white p-4 rounded shadow-sm sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>₹{totals.platformFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Inventory Fee</span><span>₹{totals.inventoryFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery Charge</span><span>₹{totals.deliveryCharge.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600 border-b pb-2"><span>GST (18%)</span><span>₹{totals.gstOnFees.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold pt-2"><span>Grand Total</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
            </div>
            <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className={`w-full mt-6 px-6 py-3 text-white font-bold rounded ${
                    loading || !selectedAddress
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                {loading 
                    ? paymentMethod === 'online' 
                        ? 'Processing Payment...' 
                        : 'Placing Order...'
                    : paymentMethod === 'online'
                        ? 'Pay Now'
                        : 'Place Order'
                }
            </button>
        </div>
      </div>
      
      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
                {addressFormData._id ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSaveAddress}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
                        <input
                            type="text"
                            name="addressLine1"
                            value={addressFormData.addressLine1}
                            onChange={handleAddressFormChange}
                            placeholder="Street address"
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input
                            type="text"
                            name="addressLine2"
                            value={addressFormData.addressLine2 || ''}
                            onChange={handleAddressFormChange}
                            placeholder="Apartment, suite, etc."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                            <input
                                type="text"
                                name="city"
                                value={addressFormData.city}
                                onChange={handleAddressFormChange}
                                placeholder="City"
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                            <input
                                type="text"
                                name="state"
                                value={addressFormData.state}
                                onChange={handleAddressFormChange}
                                placeholder="State"
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                        <input
                            type="text"
                            name="pincode"
                            value={addressFormData.pincode}
                            onChange={handleAddressFormChange}
                            placeholder="6-digit pincode"
                            required
                            pattern="\d{6}"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="defaultAddress"
                            name="isDefault"
                            checked={addressFormData.isDefault || false}
                            onChange={(e) => setAddressFormData(prev => ({
                                ...prev,
                                isDefault: e.target.checked
                            }))}
                            className="h-4 w-4"
                        />
                        <label htmlFor="defaultAddress" className="ml-2 text-sm text-gray-700">
                            Set as default address
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save Address
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}