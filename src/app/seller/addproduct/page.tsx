// 'use client';

// import { useState } from 'react';

// // Sample data for dropdowns
// const PRODUCT_CATEGORIES = [
//   'Fruit',
//   'Vegetable',
//   'Herb',
//   'Organic',
//   'Exotic'
// ];

// const FRUIT_VARIETIES = [
//   'Apple - Fuji',
//   'Apple - Granny Smith',
//   'Banana - Cavendish',
//   'Orange - Navel'
// ];

// const VEGETABLE_VARIETIES = [
//   'Tomato - Cherry',
//   'Tomato - Roma',
//   'Carrot - Regular',
//   'Potato - Russet'
// ];

// // Define a type for the delivery quote state
// type DeliveryQuote = {
//   needsPayment: boolean;
//   deliveryCost?: number;
//   vehicleType?: string;
// };

// export default function AddProductPage() {
//   const [image, setImage] = useState<File | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [varietyOptions, setVarietyOptions] = useState<string[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // ✅ 1. Add state to hold API errors
//   const [apiError, setApiError] = useState<string | null>(null);

  

//   // Update variety options when category changes
//   const handleCategoryChange = (category: string) => {
//     setSelectedCategory(category);
//     switch (category) {
//       case 'Fruit':
//         setVarietyOptions(FRUIT_VARIETIES);
//         break;
//       case 'Vegetable':
//         setVarietyOptions(VEGETABLE_VARIETIES);
//         break;
//       default:
//         setVarietyOptions([]);
//     }
//   };

//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsSubmitting(true);

//   // ✅ 2. Clear previous errors on a new submission
//   setApiError(null);
  
//   const form = e.target as HTMLFormElement;
//   const formData = new FormData(form);

//   // 1. Convert bulk pricing to required JSON format
//   const bulkPricing = [];
//   for (let i = 1; i <= 3; i++) {
//     const minQty = formData.get(`bulkMinQty${i}`);
//     const price = formData.get(`bulkPrice${i}`);
    
//     if (minQty && price && !isNaN(Number(minQty))) {
//       bulkPricing.push({
//         minQuantity: Number(minQty),
//         price: Number(price)
//       });
//     }
//   }
//   formData.set('bulkPricing', JSON.stringify(bulkPricing));

//   // Remove individual bulk pricing fields
//   for (let i = 1; i <= 3; i++) {
//     formData.delete(`bulkMinQty${i}`);
//     formData.delete(`bulkPrice${i}`);
//   }

//   // 2. Transform vitamin fields to match API route expectations
//   formData.set('vitaminA', formData.get('vitamin_A')?.toString().split(' ')[0] || '0');
//   formData.set('vitaminC', formData.get('vitamin_C')?.toString().split(' ')[0] || '0');
//   formData.set('vitaminD', formData.get('vitamin_D')?.toString().split(' ')[0] || '0');
//   formData.set('vitaminB12', formData.get('vitamin_B12')?.toString().split(' ')[0] || '0');

//   // Remove old vitamin fields
//   ['vitamin_A', 'vitamin_C', 'vitamin_K', 'folate'].forEach(field => {
//     formData.delete(field);
//   });

//   // 3. Transform mineral values to numbers (without units)
//   const mineralFields = ['calcium', 'iron', 'potassium', 'magnesium'];
//   mineralFields.forEach(field => {
//     const valueWithUnit = formData.get(field)?.toString() || '0';
//     const numericValue = valueWithUnit.split(' ')[0]; // Extract just the number
//     formData.set(field, numericValue);
//   });

//   // 4. Handle image upload
//   if (image) {
//     formData.append('image', image);
//   }

//   try {
//     const res = await fetch('/api/seller/addProduct', {
//       method: 'POST',
//       body: formData,
//     });
//     // ✅ The API call is now simpler
    
    

//     const result = await res.json();
//     if (res.status === 403) {
//         setApiError(result.error); // Set the error from the API
//         return; // Stop the function
//       }
//     if (!res.ok) throw new Error(result.error || 'Failed to add product');
    
//     alert('Product added successfully!');
//     form.reset();
//     setImage(null);
//     setSelectedCategory('');
//   } catch (error: any) {
//     // ✅ 4. Update the catch block to use the new error state instead of alert()
//     setApiError(error.message);
//     alert(error.message);
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//             Add New Product
//           </h1>
//           <p className="mt-3 text-xl text-gray-500">
//             Fill in the details of your agricultural product
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-xl rounded-2xl p-8">
//           {/* Basic Information Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>
            
//             {/* Name */}
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Product Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   placeholder="Organic Apples"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Category Dropdown */}
//               <div>
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                   Category <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="category"
//                   name="category"
//                   required
//                   value={selectedCategory}
//                   onChange={(e) => handleCategoryChange(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 >
//                   <option value="">Select a category</option>
//                   {PRODUCT_CATEGORIES.map((category) => (
//                     <option key={category} value={category}>{category}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Variety */}
//             <div>
//               <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
//                 Variety <span className="text-red-500">*</span>
//               </label>
//               {varietyOptions.length > 0 ? (
//                 <select
//                   id="variety"
//                   name="variety"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 >
//                   <option value="">Select a variety</option>
//                   {varietyOptions.map((variety) => (
//                     <option key={variety} value={variety}>{variety}</option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   id="variety"
//                   name="variety"
//                   type="text"
//                   required
//                   disabled={!selectedCategory}
//                   placeholder={selectedCategory ? "Enter variety" : "Select category first"}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:bg-gray-100"
//                 />
//               )}
//             </div>

//             {/* Description */}
//             <div>
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                 Description <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 rows={3}
//                 placeholder="Describe your product's quality, features, and benefits..."
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//               />
//             </div>
//           </div>

//           {/* Nutrition Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Nutrition Information (per 100g)</h2>
            
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
//               {/* Calories */}
//               <div>
//                 <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
//                   Calories (kcal)
//                 </label>
//                 <input
//                   id="calories"
//                   name="calories"
//                   type="number"
//                   step="0.1"
//                   placeholder="52"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Protein */}
//               <div>
//                 <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
//                   Protein (g)
//                 </label>
//                 <input
//                   id="protein"
//                   name="protein"
//                   type="number"
//                   step="0.1"
//                   placeholder="0.3"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Carbohydrates */}
//               <div>
//                 <label htmlFor="carbohydrates" className="block text-sm font-medium text-gray-700 mb-1">
//                   Carbohydrates (g)
//                 </label>
//                 <input
//                   id="carbohydrates"
//                   name="carbohydrates"
//                   type="number"
//                   step="0.1"
//                   placeholder="14"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Fiber */}
//               <div>
//                 <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-1">
//                   Fiber (g)
//                 </label>
//                 <input
//                   id="fiber"
//                   name="fiber"
//                   type="number"
//                   step="0.1"
//                   placeholder="2.4"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Sugar */}
//               <div>
//                 <label htmlFor="sugar" className="block text-sm font-medium text-gray-700 mb-1">
//                   Sugar (g)
//                 </label>
//                 <input
//                   id="sugar"
//                   name="sugar"
//                   type="number"
//                   step="0.1"
//                   placeholder="10"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Fat */}
//               <div>
//                 <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
//                   Fat (g)
//                 </label>
//                 <input
//                   id="fat"
//                   name="fat"
//                   type="number"
//                   step="0.1"
//                   placeholder="0.2"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Vitamins Section */}
//           {/* Vitamins Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vitamins</h2>
            
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
//               {/* Vitamin A */}
//               <div>
//                 <label htmlFor="vitamin_A" className="block text-sm font-medium text-gray-700 mb-1">
//                   Vitamin A (IU)
//                 </label>
//                 <input
//                   id="vitamin_A"
//                   name="vitamin_A"
//                   type="number"
//                   step="0.1"
//                   placeholder="833"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Vitamin C */}
//               <div>
//                 <label htmlFor="vitamin_C" className="block text-sm font-medium text-gray-700 mb-1">
//                   Vitamin C (mg)
//                 </label>
//                 <input
//                   id="vitamin_C"
//                   name="vitamin_C"
//                   type="number"
//                   step="0.1"
//                   placeholder="4.6"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Vitamin D */}
//               <div>
//                 <label htmlFor="vitamin_D" className="block text-sm font-medium text-gray-700 mb-1">
//                   Vitamin D (IU)
//                 </label>
//                 <input
//                   id="vitamin_D"
//                   name="vitamin_D"
//                   type="number"
//                   step="0.1"
//                   placeholder="0"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Vitamin B12 */}
//               <div>
//                 <label htmlFor="vitamin_B12" className="block text-sm font-medium text-gray-700 mb-1">
//                   Vitamin B12 (mcg)
//                 </label>
//                 <input
//                   id="vitamin_B12"
//                   name="vitamin_B12"
//                   type="number"
//                   step="0.1"
//                   placeholder="0"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>
//             </div>
//           </div>
//           {/* Minerals Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Minerals</h2>
            
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
//               {/* Calcium */}
//               <div>
//                 <label htmlFor="calcium" className="block text-sm font-medium text-gray-700 mb-1">
//                   Calcium
//                 </label>
//                 <input
//                   id="calcium"
//                   name="calcium"
//                   type="number"
//                   step="0.1"
//                   placeholder="6"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Iron */}
//               <div>
//                 <label htmlFor="iron" className="block text-sm font-medium text-gray-700 mb-1">
//                   Iron
//                 </label>
//                 <input
//                   id="iron"
//                   name="iron"
//                   type="number"
//                   step="0.1"
//                   placeholder="0.1"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Potassium */}
//               <div>
//                 <label htmlFor="potassium" className="block text-sm font-medium text-gray-700 mb-1">
//                   Potassium
//                 </label>
//                 <input
//                   id="potassium"
//                   name="potassium"
//                   type="number"
//                   step="0.1"
//                   placeholder="107"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Magnesium */}
//               <div>
//                 <label htmlFor="magnesium" className="block text-sm font-medium text-gray-700 mb-1">
//                   Magnesium
//                 </label>
//                 <input
//                   id="magnesium"
//                   name="magnesium"
//                   type="number"
//                   step="0.1"
//                   placeholder="5"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Pricing & Inventory Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Pricing & Inventory</h2>
            
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//               {/* Base Price */}
//               <div>
//                 <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
//                   Base Price (₹) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="basePrice"
//                   name="basePrice"
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   placeholder="100.00"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Discounted Price */}
//               <div>
//                 <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
//                   Discounted Price (₹)
//                 </label>
//                 <input
//                   id="discountedPrice"
//                   name="discountedPrice"
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   placeholder="90.00"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* Stock Quantity */}
//               <div>
//                 <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
//                   Stock Quantity <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="itemQuantity"
//                   name="itemQuantity"
//                   type="number"
//                   min="0"
//                   placeholder="50"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//               </div>

//               {/* GST Percentage */}
//               <div>
//                 <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-1">
//                   GST Percentage <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="gstPercentage"
//                   name="gstPercentage"
//                   required
//                   defaultValue="5"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 >
//                   <option value="0">0% (Exempt)</option>
//                   <option value="5">5%</option>
//                   <option value="12">12%</option>
//                   <option value="18">18%</option>
//                   <option value="28">28%</option>
//                 </select>
//               </div>
//             </div>

//             {/* Bulk Pricing */}
//             <div className="space-y-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Bulk Pricing
//               </label>
              
//               {/* Bulk Pricing Rule 1 */}
//               <div className="grid grid-cols-2 gap-4 items-end">
//                 <div>
//                   <label htmlFor="bulkMinQty1" className="block text-xs font-medium text-gray-500 mb-1">
//                     Minimum Quantity
//                   </label>
//                   <input
//                     id="bulkMinQty1"
//                     name="bulkMinQty1"
//                     type="number"
//                     min="1"
//                     placeholder="10"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="bulkPrice1" className="block text-xs font-medium text-gray-500 mb-1">
//                     Price per unit (₹)
//                   </label>
//                   <input
//                     id="bulkPrice1"
//                     name="bulkPrice1"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="90.00"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
//                   />
//                 </div>
//               </div>

//               {/* Bulk Pricing Rule 2 */}
//               <div className="grid grid-cols-2 gap-4 items-end">
//                 <div>
//                   <label htmlFor="bulkMinQty2" className="block text-xs font-medium text-gray-500 mb-1">
//                     Minimum Quantity
//                   </label>
//                   <input
//                     id="bulkMinQty2"
//                     name="bulkMinQty2"
//                     type="number"
//                     min="1"
//                     placeholder="50"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="bulkPrice2" className="block text-xs font-medium text-gray-500 mb-1">
//                     Price per unit (₹)
//                   </label>
//                   <input
//                     id="bulkPrice2"
//                     name="bulkPrice2"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="80.00"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
//                   />
//                 </div>
//               </div>

//               {/* Add more rules as needed */}
//               <button
//                 type="button"
//                 className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 + Add Another Tier
//               </button>

//               {/* Hidden field that will contain the final JSON */}
//               <input type="hidden" name="bulkPricing" id="bulkPricing" />
//             </div>
//           </div>

//           {/* Image Upload */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Product Image</h2>
            
//             <div className="flex items-center justify-center w-full">
//               <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
//                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
//                   </svg>
//                   <p className="mb-2 text-sm text-gray-500">
//                     <span className="font-semibold">Click to upload</span> or drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG, JPEG (MAX. 5MB)
//                   </p>
//                 </div>
//                 <input 
//                   id="dropzone-file" 
//                   type="file" 
//                   className="hidden" 
//                   accept="image/*"
//                   onChange={(e) => setImage(e.target.files?.[0] || null)}
//                 />
//               </label>
//             </div>

//             {image && (
//               <div className="mt-4 flex flex-col items-center">
//                 <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
//                 <img 
//                   src={URL.createObjectURL(image)} 
//                   alt="Preview" 
//                   className="h-48 object-contain rounded-lg border border-gray-200"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setImage(null)}
//                   className="mt-2 text-sm text-red-600 hover:text-red-800"
//                 >
//                   Remove Image
//                 </button>
//               </div>
              
              

//             )}
//           </div>
//           <div>
//                 <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
//                   Expiry Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="expiryDate"
//                   name="expiryDate"
//                   type="date"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//                 />
//             </div>

//             {/* ✅ 5. Conditionally render the error message above the submit button */}
//           {apiError && (
//             <div className="p-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
//               <span className="font-medium">Error:</span> {apiError}
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all ${
//                 isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
//               }`}
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </span>
//               ) : (
//                 'Add Product'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { toast } from 'react-hot-toast';

// Sample data for dropdowns
const PRODUCT_CATEGORIES = [
  'Fruit',
  'Vegetable',
  'Herb',
  'Organic',
  'Exotic'
];

const FRUIT_VARIETIES = [
  'Apple - Fuji',
  'Apple - Granny Smith',
  'Banana - Cavendish',
  'Orange - Navel'
];

const VEGETABLE_VARIETIES = [
  'Tomato - Cherry',
  'Tomato - Roma',
  'Carrot - Regular',
  'Potato - Russet'
];

// Define a type for the delivery quote state
type DeliveryQuote = {
  needsPayment: boolean;
  deliveryCost?: number;
  vehicleType?: string;
};

export default function AddProductPage() {
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [varietyOptions, setVarietyOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // NEW STATE: To manage the delivery quote and payment step
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [formCache, setFormCache] = useState<FormData | null>(null);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    switch (category) {
      case 'Fruit':
        setVarietyOptions(FRUIT_VARIETIES);
        break;
      case 'Vegetable':
        setVarietyOptions(VEGETABLE_VARIETIES);
        break;
      default:
        setVarietyOptions([]);
    }
  };

  // THIS REPLACES your old handleSubmit function
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setFormCache(formData); // Cache the form data for the next step

    // --- STEP A: GET DELIVERY QUOTE ---
    try {
      const quoteRes = await fetch('/api/seller/delivery-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalWeightInKg: Number(formData.get('itemQuantity')),
        }),
      });

      const quoteData = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quoteData.error || 'Failed to get quote');
      
      setQuote(quoteData);

      // If no payment is needed (Enterprise plan), submit the product directly
      if (!quoteData.needsPayment) {
        await submitProduct(formData, 'exempt');
      }

    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Function to handle the final product submission
  const submitProduct = async (formData: FormData, paymentMethod: 'online' | 'cod' | 'exempt') => {
    setIsSubmitting(true);
    setApiError(null);

    // Add payment method and cost to the form data
    formData.append('paymentMethod', paymentMethod);
    if (quote?.deliveryCost) {
      formData.append('deliveryCost', quote.deliveryCost.toString());
    }

    // Convert bulk pricing to required JSON format
    const bulkPricing = [];
    for (let i = 1; i <= 3; i++) {
      const minQty = formData.get(`bulkMinQty${i}`);
      const price = formData.get(`bulkPrice${i}`);
      
      if (minQty && price && !isNaN(Number(minQty))) {
        bulkPricing.push({
          minQuantity: Number(minQty),
          price: Number(price)
        });
      }
    }
    formData.set('bulkPricing', JSON.stringify(bulkPricing));

    // Remove individual bulk pricing fields
    for (let i = 1; i <= 3; i++) {
      formData.delete(`bulkMinQty${i}`);
      formData.delete(`bulkPrice${i}`);
    }

    // Transform vitamin fields to match API route expectations
    // In your submitProduct function, change:
    formData.set('vitaminA', formData.get('vitamin_A')?.toString().split(' ')[0] || '0');
    formData.set('vitaminC', formData.get('vitamin_C')?.toString().split(' ')[0] || '0');

    // Add the expected fields:
    formData.set('vitaminK', '0'); // Default value since frontend doesn't have this
    formData.set('folate', '0');   // Default value

    // Remove old vitamin fields
    ['vitamin_A', 'vitamin_C', 'vitamin_K', 'folate'].forEach(field => {
      formData.delete(field);
    });

    // Transform mineral values to numbers (without units)
    // Change mineral processing to just get the numeric value without unit splitting
    const mineralFields = ['calcium', 'iron', 'potassium', 'magnesium'];
    mineralFields.forEach(field => {
      const value = formData.get(field)?.toString() || '0';
      // Just use the value directly (backend expects string)
      formData.set(field, value);
    });
    // Add currency field before submitting
    formData.append('currency', 'INR');

    // Handle image upload
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('/api/seller/addProduct', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.status === 403) {
        setApiError(result.error); // Set the error from the API
        return; // Stop the function
      }
      
      if (!res.ok) throw new Error(result.error || 'Failed to add product');
      
      if (result.paymentInitiated) {
        handleOnlinePayment(result.order, result.product._id);
      } else {
        toast.success(result.message || 'Product submitted successfully!');
        resetForm();
      }

    } catch (error: any) {
      setApiError(error.message);
    } finally {
      // Don't set isSubmitting to false here, as Razorpay needs it
    }
  };
  
  // UPDATED: Function to handle Razorpay checkout with payment verification
  const handleOnlinePayment = (order: any, pendingProductId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      order_id: order.id,
      name: "KrishiMart Delivery Fee",
      description: "Transaction for product transport",
      handler: async (response: any) => {
        // This function is called after successful payment on Razorpay's side
        try {
          const verificationRes = await fetch('/api/seller/verify-delivery-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentDetails: response,
              pendingProductId: pendingProductId,
            }),
          });
          
          const result = await verificationRes.json();
          if (!verificationRes.ok) throw new Error(result.error);
          
          toast.success("Payment verified! Your product has been submitted.");
          resetForm();
        } catch (error: any) {
          setApiError(error.message);
          toast.error("Payment verification failed. Please contact support.");
        } finally {
          setIsSubmitting(false);
        }
      },
      modal: {
        ondismiss: function() {
          // This function is called when the user closes the payment pop-up
          setIsSubmitting(false);
          setApiError("Payment was cancelled.");
        }
      },
      prefill: {},
      theme: { color: "#22c55e" }
    };
    
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };
  
  // NEW: Helper to reset the form state
  const resetForm = () => {
  const form = document.querySelector('form');
  form?.reset();
  setImage(null);
  setQuote(null);
  setFormCache(null);
  setSelectedCategory('');
  setVarietyOptions([]);
  setApiError(null);
  setIsSubmitting(false);
};

  return (
    <>
      {/* Add Razorpay script to the page */}
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Add New Product
            </h1>
            <p className="mt-3 text-xl text-gray-500">
              Fill in the details of your agricultural product
            </p>
          </div>

          {/* IMPORTANT: The form's onSubmit is now handleFormSubmit */}
          <form onSubmit={handleFormSubmit} className="space-y-8 bg-white shadow-xl rounded-2xl p-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>
              
              {/* Name */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Organic Apples"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  >
                    <option value="">Select a category</option>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variety */}
              <div>
                <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
                  Variety <span className="text-red-500">*</span>
                </label>
                {varietyOptions.length > 0 ? (
                  <select
                    id="variety"
                    name="variety"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  >
                    <option value="">Select a variety</option>
                    {varietyOptions.map((variety) => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="variety"
                    name="variety"
                    type="text"
                    required
                    disabled={!selectedCategory}
                    placeholder={selectedCategory ? "Enter variety" : "Select category first"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:bg-gray-100"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Describe your product's quality, features, and benefits..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
            </div>

            {/* Nutrition Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Nutrition Information (per 100g)</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {/* Calories */}
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    id="calories"
                    name="calories"
                    type="number"
                    step="0.1"
                    placeholder="52"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Protein */}
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                 
                  <input
                    id="protein"
                    name="protein"  
                    type="number"
                    step="0.1"
                    placeholder="0.3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Carbohydrates */}
                <div>
                  <label htmlFor="carbohydrates" className="block text-sm font-medium text-gray-700 mb-1">
                    Carbohydrates (g)
                  </label>
                  <input
                    id="carbohydrates"
                    name="carbohydrates"
                    type="number"
                    step="0.1"
                    placeholder="14"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Fiber */}
                <div>
                  <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    id="fiber"
                    name="fiber"
                    type="number"
                    step="0.1"
                    placeholder="2.4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Sugar */}
                <div>
                  <label htmlFor="sugar" className="block text-sm font-medium text-gray-700 mb-1">
                    Sugar (g)
                  </label>
                  <input
                    id="sugar"
                    name="sugar"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Fat */}
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    id="fat"
                    name="fat"
                    type="number"
                    step="0.1"
                    placeholder="0.2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Vitamins Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vitamins</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {/* Vitamin A */}
                <div>
                  <label htmlFor="vitamin_A" className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin A (IU)
                  </label>
                  <input
                    id="vitamin_A"
                    name="vitamin_A"
                    type="number"
                    step="0.1"
                    placeholder="833"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Vitamin C */}
                <div>
                  <label htmlFor="vitamin_C" className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin C (mg)
                  </label>
                  <input
                    id="vitamin_C"
                    name="vitamin_C"
                    type="number"
                    step="0.1"
                    placeholder="4.6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Vitamin D */}
                <div>
                  <label htmlFor="vitamin_D" className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin D (IU)
                  </label>
                  <input
                    id="vitamin_D"
                    name="vitamin_D"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Vitamin B12 */}
                <div>
                  <label htmlFor="vitamin_B12" className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin B12 (mcg)
                  </label>
                  <input
                    id="vitamin_B12"
                    name="vitamin_B12"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Minerals Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Minerals</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {/* Calcium */}
                <div>
                  <label htmlFor="calcium" className="block text-sm font-medium text-gray-700 mb-1">
                    Calcium
                  </label>
                  <input
                    id="calcium"
                    name="calcium"
                    type="number"
                    step="0.1"
                    placeholder="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Iron */}
                <div>
                  <label htmlFor="iron" className="block text-sm font-medium text-gray-700 mb-1">
                    Iron
                  </label>
                  <input
                    id="iron"
                    name="iron"
                    type="number"
                    step="0.1"
                    placeholder="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Potassium */}
                <div>
                  <label htmlFor="potassium" className="block text-sm font-medium text-gray-700 mb-1">
                    Potassium
                  </label>
                  <input
                    id="potassium"
                    name="potassium"
                    type="number"
                    step="0.1"
                    placeholder="107"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Magnesium */}
                <div>
                  <label htmlFor="magnesium" className="block text-sm font-medium text-gray-700 mb-1">
                    Magnesium
                  </label>
                  <input
                    id="magnesium"
                    name="magnesium"
                    type="number"
                    step="0.1"
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Base Price */}
                <div>
                  <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    required
                    className="w-full px-4 py-3 border border-gray极地
                    -300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Discounted Price */}
                <div>
                  <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    id="discountedPrice"
                    name="discountedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="90.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="itemQuantity"
                    name="itemQuantity"
                    type="number"
                    min="0"
                    placeholder="50"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* GST Percentage */}
                <div>
                  <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Percentage <span className="极地
                    text-red-500">*</span>
                  </label>
                  <select
                    id="gstPercentage"
                    name="gstPercentage"
                    required
                    defaultValue="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              {/* Bulk Pricing */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulk Pricing
                </label>
                
                {/* Bulk Pricing Rule 1 */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label htmlFor="bulkMinQty1" className="block text-xs font-medium text-gray-500 mb-1">
                      Minimum Quantity
                    </label>
                    <input
                      id="bulk极地
                      MinQty1"
                      name="bulkMinQty1"
                      type="number"
                      min="1"
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:极地
                      border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulkPrice1" className="block text-xs font-medium text-gray-500 mb-1">
                      Price per unit (₹)
                    </label>
                    <input
                      id="bulkPrice1"
                      name="bulkPrice1"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="90.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Bulk Pricing Rule 2 */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label htmlFor="bulkMinQty2" className="block text-xs font-medium text-gray-500 mb-1">
                      Minimum Quantity
                    </label>
                    <input
                      id="bulkMinQty2"
                      name="bulkMinQty2"
                      type="number"
                      min="1"
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulkPrice2" className="block极地
                     text-xs font-medium text-gray-500极地
                     mb-1">
                      Price per unit (₹)
                    </label>
                    <input
                      id="bulkPrice2"
                      name="bulkPrice2"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="80.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Add more rules as needed */}
                <button
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  + Add Another Tier
                </button>

                {/* Hidden field that will contain the final JSON */}
                <input type="hidden" name="bulkPricing" id="bulkPricing" />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Product Image</h2>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex极地
                   flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13极地
                      h3a3 3 0 0 0 0-6h-.025A5.56 5.56 极地
                      0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {image && (
                <div className="mt-4 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-极地
                  700 mb-2">Preview</h3>
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="Preview" 
                    className="h-48 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                id="expiryDate"
                name="expiryDate"
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>

            {apiError && (
              <div className="p-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
                <span className="font-medium">Error:</span> {apiError}
              </div>
            )}

            {/* DYNAMIC SUBMIT SECTION (replaces your old submit button) */}
            <div className="pt-5 border-t border-gray-200 mt-8">
              {quote && quote.needsPayment ? (
                // --- SHOWS AFTER QUOTE IS RECEIVED ---
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-800">Delivery Quote Ready</h3>
                  <p className="text-lg">Vehicle Type: <span className="font-bold text-green-700">{quote.vehicleType}</span></p>
                  <p className="text-lg">Delivery Cost: <span className="font-bold text-green-700">₹{quote.deliveryCost}</span></p>
                  <p className="text-sm text-gray-600">Please select a payment method to submit your product.</p>
                  <div className="flex justify-center space-x-4 pt-2">
                    <button 
                      type="button" 
                      onClick={() => submitProduct(formCache!, 'online')} 
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Pay Online Now'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => submitProduct(formCache!, 'cod')} 
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Pay with Cash on Delivery'}
                    </button>
                  </div>
                </div>
              ) : (
                // --- INITIAL SUBMIT BUTTON ---
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="极地
                      0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting Quote...
                    </span>
                  ) : (
                    'Get Delivery Quote & Proceed'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}