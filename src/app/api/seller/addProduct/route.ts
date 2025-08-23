
// import connect from '@/dbConfig/dbConfig';
// import Seller from '@/models/sellerModel';
// import PendingProduct from '@/models/pendingProductModel';
// import Warehouse from '@/models/warehouseModel';
// import { NextRequest, NextResponse } from 'next/server';
// import { v2 as cloudinary } from 'cloudinary';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';
// import Product from '@/models/productModel'; // ✅ Import the Product model

// connect();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
//     }

//     let sellerId: string;
//     try {
//       const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
//       sellerId = decoded.id;
//     } catch (err) {
//       return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
//     }

//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return NextResponse.json({ error: "Seller not found" }, { status: 404 });
//     }


//     // --- ✅ NEW LOGIC: SUBSCRIPTION LIMIT CHECK ---
//      // Step 1: Check if the seller is on the 'basic' plan
//      if (seller.subscriptionPlan === 'basic') {
//       // Step 2: Count products created in the last 30 days
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//       const query = {
//         sellerId: sellerId,
//         createdAt: { $gte: thirtyDaysAgo },
//       };

//       // Count both approved and pending products for an accurate total
//       const [pendingCount, approvedCount] = await Promise.all([
//         PendingProduct.countDocuments(query),
//         Product.countDocuments(query)
//       ]);
      
//       const totalProductsInLast30Days = pendingCount + approvedCount;

//       // Step 3: Enforce the limit
//       if (totalProductsInLast30Days >= 12) {
//         return NextResponse.json(
//           { error: "You have reached your monthly product limit of 15 for the basic plan. Please upgrade to add more." },
//           { status: 403 } // 403 Forbidden is a good status code for this
//         );
//       }
//     }
//     // --- END OF SUBSCRIPTION CHECK ---


//     const formData = await request.formData();
    
//     // ✅ NEW: Read and validate the expiryDate from the form
//     const expiryDateRaw = formData.get('expiryDate') as string | null;
//     if (!expiryDateRaw) {
//       return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
//     }
//     const expiryDate = new Date(expiryDateRaw);
//     if (isNaN(expiryDate.getTime())) {
//       return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
//     }

//     const imageFile = formData.get('image');

//     if (!imageFile || !(imageFile instanceof File)) {
//       return NextResponse.json({ error: "Image file is required" }, { status: 400 });
//     }

//     const category = formData.get('category') as string;
//     const variety = formData.get('variety') as string;
//     if (!category || !variety) {
//       return NextResponse.json({ error: "Category and variety are required" }, { status: 400 });
//     }

//     // Generate SKU
//     const skuPrefix = seller.sku || sellerId.slice(-4).toUpperCase(); // fallback if sku missing
//     const categoryPrefix = category.substring(0, 3).toUpperCase();
//     const varietyCode = variety.substring(0, 3).toUpperCase();
//     const timeSuffix = Date.now().toString().slice(-4);
//     const fullSku = `${skuPrefix}-${categoryPrefix}-${varietyCode}-${timeSuffix}`;

//     // Upload image
//     const buffer = Buffer.from(await imageFile.arrayBuffer());
//     const cloudinaryResult = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream(
//         { resource_type: 'image' },
//         (err, result) => {
//           if (err) reject(err);
//           else resolve(result);
//         }
//       ).end(buffer);
//     });

//     // Build nested fields
//     const vitamins = {
//       vitamin_A: formData.get('vitaminA') as string || '0',
//       vitamin_C: formData.get('vitaminC') as string || '0',
//       vitamin_K: formData.get('vitaminK') as string || '0',
//       folate: formData.get('folate') as string || '0',
//     };

//     const minerals = {
//       calcium: formData.get('calcium') as string || '0',
//       iron: formData.get('iron') as string || '0',
//       magnesium: formData.get('magnesium') as string || '0',
//       potassium: formData.get('potassium') as string || '0',
//     };

//     const nutrition = {
//       calories: parseFloat(formData.get('calories') as string || '0'),
//       protein: parseFloat(formData.get('protein') as string || '0'),
//       carbohydrates: parseFloat(formData.get('carbohydrates') as string || '0'),
//       fiber: parseFloat(formData.get('fiber') as string || '0'),
//       sugar: parseFloat(formData.get('sugar') as string || '0'),
//       fat: parseFloat(formData.get('fat') as string || '0'),
//     };

//     const pricing = {
//       basePrice: parseFloat(formData.get('basePrice') as string || '0'),
//       discountedPrice: parseFloat(formData.get('discountedPrice') as string || '0'),
//       currency: formData.get('currency') || 'INR',
//       bulkPricing: JSON.parse(formData.get('bulkPricing') as string || '[]'),
//       gstPercentage: parseFloat(formData.get('gstPercentage') as string || '5'),
//     };

//     // Find warehouse by seller pincode
//         // Find warehouse by seller pincode
//     const sellerPincode = seller.businessAddress?.pincode;
//     const sellerAddress = seller.businessAddress; // Correctly reference the address object

//     const warehouse = await Warehouse.findOne({ serviceablePincodes: sellerPincode });
//     if (!warehouse) {
//       return NextResponse.json({ error: "No warehouse found for seller's pincode" }, { status: 400 });
//     }

//     // Build and save pending product
//     const newPendingProduct = new PendingProduct({
//       sellerId,
//       sku: fullSku,
//       name: formData.get('name'),
//       category,
//       variety,
//       description: formData.get('description'),
//       nutrition,
//       vitamins,
//       minerals,
//       pricing,
//       imageUrl: (cloudinaryResult as any).secure_url,
//       itemQuantity: parseInt(formData.get('itemQuantity') as string || '0'),
//       expiryDate, // ✅ NEW: Persist the validated expiryDate
//       sellerPincode,
//       sellerAddress,
//       warehouseId: warehouse._id,
//       approved: false,
//     });

//     const savedPendingProduct = await newPendingProduct.save();

//     return NextResponse.json({
//       message: "Product submitted for approval",
//       success: true,
//       product: savedPendingProduct,
//     });

//   } catch (error: any) {
//     console.error("Product upload error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// import connect from '@/dbConfig/dbConfig';
// import Seller from '@/models/sellerModel';
// import PendingProduct from '@/models/pendingProductModel';
// import Warehouse from '@/models/warehouseModel';
// import Product from '@/models/productModel';
// import { NextRequest, NextResponse } from 'next/server';
// import { v2 as cloudinary } from 'cloudinary';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';
// import Razorpay from 'razorpay';

// connect();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(request: NextRequest) {
//   try {
//     // 1. AUTHENTICATION & SELLER VALIDATION
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
//     }

//     let sellerId: string;
//     try {
//       const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
//       sellerId = decoded.id;
//     } catch (err) {
//       return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
//     }

//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return NextResponse.json({ error: "Seller not found" }, { status: 404 });
//     }

//     // 2. SUBSCRIPTION LIMIT CHECK
//     if (seller.subscriptionPlan === 'basic') {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       const query = { sellerId, createdAt: { $gte: thirtyDaysAgo } };
//       const [pendingCount, approvedCount] = await Promise.all([
//         PendingProduct.countDocuments(query),
//         Product.countDocuments(query)
//       ]);
//       if (pendingCount + approvedCount >= 15) {
//         return NextResponse.json(
//           { error: "You have reached your monthly product limit of 15 for the basic plan. Please upgrade to add more." },
//           { status: 403 }
//         );
//       }
//     }

//     // 3. FORM DATA PROCESSING
//     const formData = await request.formData();
//     const paymentMethod = formData.get('paymentMethod') as 'online' | 'cod' | 'exempt';

//     if (!paymentMethod) {
//       return NextResponse.json({ error: "Payment method not provided." }, { status: 400 });
//     }

//     // Image Upload to Cloudinary
//     const imageFile = formData.get('image') as File;
//     if (!imageFile) {
//       return NextResponse.json({ error: "Image file is required" }, { status: 400 });
//     }

//     // Read and validate the expiryDate from the form
//     const expiryDateRaw = formData.get('expiryDate') as string | null;
//     if (!expiryDateRaw) {
//       return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
//     }
//     const expiryDate = new Date(expiryDateRaw);
//     if (isNaN(expiryDate.getTime())) {
//       return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
//     }

//     const category = formData.get('category') as string;
//     const variety = formData.get('variety') as string;
//     if (!category || !variety) {
//       return NextResponse.json({ error: "Category and variety are required" }, { status: 400 });
//     }

//     // Upload image
//     const buffer = Buffer.from(await imageFile.arrayBuffer());
//     const cloudinaryResult = await new Promise<any>((resolve, reject) => {
//       cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
//         if (err) reject(err); else resolve(result);
//       }).end(buffer);
//     });

//     // Build nested fields
//     const vitamins = {
//       vitamin_A: formData.get('vitamin_A') as string || '0',
//       vitamin_C: formData.get('vitamin_C') as string || '0',
//       vitamin_K: formData.get('vitamin_K') as string || '0',
//       folate: formData.get('folate') as string || '0',
//     };

//     const minerals = {
//       calcium: formData.get('calcium') as string || '0',
//       iron: formData.get('iron') as string || '0',
//       magnesium: formData.get('magnesium') as string || '0',
//       potassium: formData.get('potassium') as string || '0',
//     };

//     const nutrition = {
//       calories: parseFloat(formData.get('calories') as string || '0'),
//       protein: parseFloat(formData.get('protein') as string || '0'),
//       carbohydrates: parseFloat(formData.get('carbohydrates') as string || '0'),
//       fiber: parseFloat(formData.get('fiber') as string || '0'),
//       sugar: parseFloat(formData.get('sugar') as string || '0'),
//       fat: parseFloat(formData.get('fat') as string || '0'),
//     };

//     const pricing = {
//       basePrice: parseFloat(formData.get('basePrice') as string || '0'),
//       discountedPrice: parseFloat(formData.get('discountedPrice') as string || '0'),
//       currency: formData.get('currency') || 'INR',
//       bulkPricing: JSON.parse(formData.get('bulkPricing') as string || '[]'),
//       gstPercentage: parseFloat(formData.get('gstPercentage') as string || '5'),
//     };

//     // Find warehouse by seller pincode
//     const sellerPincode = seller.businessAddress?.pincode;
//     const sellerAddress = seller.businessAddress;

//     const warehouse = await Warehouse.findOne({ serviceablePincodes: sellerPincode });
//     if (!warehouse) {
//       return NextResponse.json({ error: "No warehouse found for seller's pincode" }, { status: 400 });
//     }

//     // Generate SKU
//     const skuPrefix = seller.sku || sellerId.slice(-4).toUpperCase();
//     const categoryPrefix = category.substring(0, 3).toUpperCase();
//     const varietyCode = variety.substring(0, 3).toUpperCase();
//     const timeSuffix = Date.now().toString().slice(-4);
//     const fullSku = `${skuPrefix}-${categoryPrefix}-${varietyCode}-${timeSuffix}`;

//     // Build the complete product data object from the form
//     const productDataObject = {
//       sellerId,
//       name: formData.get('name'),
//       sku: fullSku,
//       description: formData.get('description'),
//       category,
//       variety,
//       itemQuantity: parseInt(formData.get('itemQuantity') as string || '0'),
//       expiryDate,
//       imageUrl: cloudinaryResult.secure_url,
//       pricing,
//       nutrition,
//       vitamins,
//       minerals,
//       sellerPincode,
//       sellerAddress,
//       warehouseId: warehouse._id,
//       approved: false,
//     };

//     // 4. HANDLE SUBMISSION BASED ON PAYMENT METHOD

//     // Case 1: Enterprise plan or Cash on Delivery
//     if (paymentMethod === 'exempt' || paymentMethod === 'cod') {
//       const newPendingProduct = new PendingProduct({
//         ...productDataObject,
//         status: 'pending',
//         deliveryPaymentMethod: paymentMethod,
//         deliveryPaymentStatus: paymentMethod === 'exempt' ? 'paid' : 'pending',
//       });
      
//       await newPendingProduct.save();
      
//       const message = paymentMethod === 'cod' 
//         ? "Product submitted with Cash on Delivery"
//         : "Product submitted for approval";
      
//       return NextResponse.json({ 
//         message, 
//         success: true,
//         product: newPendingProduct,
//       });
//     }

//     // Case 2: Online Payment
//     if (paymentMethod === 'online') {
//       const deliveryCost = parseFloat(formData.get('deliveryCost') as string);

//       // Create a Razorpay Order
//       const options = {
//         amount: deliveryCost * 100, // Amount in paise
//         currency: "INR",
//         receipt: `receipt_for_${sellerId}_${Date.now()}`,
//       };
      
//       const order = await razorpay.orders.create(options);
      
//       // Create the product with 'awaiting-payment' status
//       const newPendingProduct = new PendingProduct({
//         ...productDataObject,
//         status: 'awaiting-payment',
//         deliveryCost,
//         deliveryPaymentMethod: 'online',
//         paymentOrderId: order.id,
//         expiresAt: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
//       });
      
//       await newPendingProduct.save();
      
//       // Send the order details to the frontend to open checkout
//       return NextResponse.json({
//         success: true,
//         paymentInitiated: true,
//         order: order,
//         product: newPendingProduct,
//       });
//     }

//     return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });

//   } catch (error: any) {
//     console.error("Product upload error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
import PendingProduct from '@/models/pendingProductModel';
import Warehouse from '@/models/warehouseModel';
import Product from '@/models/productModel';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';

connect();
console.log("✅ DB Connected");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("✅ Cloudinary Configured");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});
console.log("✅ Razorpay Configured");

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API Called: Product Upload");

    // 1. AUTHENTICATION & SELLER VALIDATION
    const cookieStore = await cookies();
    console.log("✅ Cookies fetched");

    const token = cookieStore.get('token')?.value;
    console.log("🔑 Token:", token);

    if (!token) {
      console.log("❌ No token found");
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }

    let sellerId: string;
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
      sellerId = decoded.id;
      console.log("✅ Token Decoded, Seller ID:", sellerId);
    } catch (err) {
      console.log("❌ Token verification failed:", err);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const seller = await Seller.findById(sellerId);
    console.log("✅ Seller fetched:", seller?._id);

    if (!seller) {
      console.log("❌ Seller not found");
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // 2. SUBSCRIPTION LIMIT CHECK
    if (seller.subscriptionPlan === 'basic') {
      console.log("🔎 Checking subscription limits for BASIC plan");
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const query = { sellerId, createdAt: { $gte: thirtyDaysAgo } };
      const [pendingCount, approvedCount] = await Promise.all([
        PendingProduct.countDocuments(query),
        Product.countDocuments(query)
      ]);
      console.log("✅ Product Counts → Pending:", pendingCount, " Approved:", approvedCount);

      if (pendingCount + approvedCount >= 15) {
        console.log("❌ Limit reached");
        return NextResponse.json(
          { error: "You have reached your monthly product limit of 15 for the basic plan. Please upgrade to add more." },
          { status: 403 }
        );
      }
    }

    // 3. FORM DATA PROCESSING
    const formData = await request.formData();
    console.log("✅ FormData received");

    const paymentMethod = formData.get('paymentMethod') as 'online' | 'cod' | 'exempt';
    console.log("🔑 Payment Method:", paymentMethod);

    if (!paymentMethod) {
      console.log("❌ No payment method");
      return NextResponse.json({ error: "Payment method not provided." }, { status: 400 });
    }

    // Image Upload to Cloudinary
    const imageFile = formData.get('image') as File;
    console.log("🔎 ImageFile:", !!imageFile);

    if (!imageFile) {
      console.log("❌ Image not provided");
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Expiry Date
    const expiryDateRaw = formData.get('expiryDate') as string | null;
    console.log("🔎 Raw Expiry Date:", expiryDateRaw);

    if (!expiryDateRaw) {
      return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
    }
    const expiryDate = new Date(expiryDateRaw);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
    }
    console.log("✅ Expiry Date Parsed:", expiryDate);

    // Category + Variety
    const category = formData.get('category') as string;
    const variety = formData.get('variety') as string;
    console.log("🔎 Category:", category, " Variety:", variety);

    if (!category || !variety) {
      return NextResponse.json({ error: "Category and variety are required" }, { status: 400 });
    }

    // Upload image
    console.log("📤 Uploading to Cloudinary...");
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const cloudinaryResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
        if (err) {
          console.log("❌ Cloudinary upload failed:", err);
          reject(err);
        } else {
          console.log("✅ Cloudinary upload success:", result?.secure_url);
          resolve(result);
        }
      }).end(buffer);
    });

    // Build nested fields
    console.log("📦 Building nutrition data");
    const vitamins = {
      vitamin_A: formData.get('vitamin_A') as string || '0',
      vitamin_C: formData.get('vitamin_C') as string || '0',
      vitamin_K: formData.get('vitamin_K') as string || '0',
      folate: formData.get('folate') as string || '0',
    };

    const minerals = {
      calcium: formData.get('calcium') as string || '0',
      iron: formData.get('iron') as string || '0',
      magnesium: formData.get('magnesium') as string || '0',
      potassium: formData.get('potassium') as string || '0',
    };

    const nutrition = {
      calories: parseFloat(formData.get('calories') as string || '0'),
      protein: parseFloat(formData.get('protein') as string || '0'),
      carbohydrates: parseFloat(formData.get('carbohydrates') as string || '0'),
      fiber: parseFloat(formData.get('fiber') as string || '0'),
      sugar: parseFloat(formData.get('sugar') as string || '0'),
      fat: parseFloat(formData.get('fat') as string || '0'),
    };

    const pricing = {
      basePrice: parseFloat(formData.get('basePrice') as string || '0'),
      discountedPrice: parseFloat(formData.get('discountedPrice') as string || '0'),
      currency: formData.get('currency') || 'INR',
      bulkPricing: JSON.parse(formData.get('bulkPricing') as string || '[]'),
      gstPercentage: parseFloat(formData.get('gstPercentage') as string || '5'),
    };
    console.log("✅ Nutrition + Pricing built");

    // Find warehouse
    console.log("🔎 Finding Warehouse for Pincode:", seller.businessAddress?.pincode);
    const sellerPincode = seller.businessAddress?.pincode;
    const sellerAddress = seller.businessAddress;

    const warehouse = await Warehouse.findOne({ serviceablePincodes: sellerPincode });
    console.log("✅ Warehouse found:", warehouse?._id);

    if (!warehouse) {
      return NextResponse.json({ error: "No warehouse found for seller's pincode" }, { status: 400 });
    }

    // Generate SKU
    console.log("⚙️ Generating SKU");
    const skuPrefix = seller.sku || sellerId.slice(-4).toUpperCase();
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const varietyCode = variety.substring(0, 3).toUpperCase();
    const timeSuffix = Date.now().toString().slice(-4);
    const fullSku = `${skuPrefix}-${categoryPrefix}-${varietyCode}-${timeSuffix}`;
    console.log("✅ SKU Generated:", fullSku);

    // Build product object
    console.log("📦 Building Product Object");
    const productDataObject = {
      sellerId,
      name: formData.get('name'),
      sku: fullSku,
      description: formData.get('description'),
      category,
      variety,
      itemQuantity: parseInt(formData.get('itemQuantity') as string || '0'),
      expiryDate,
      imageUrl: cloudinaryResult.secure_url,
      pricing,
      nutrition,
      vitamins,
      minerals,
      sellerPincode,
      sellerAddress,
      warehouseId: warehouse._id,
      approved: false,
    };
    console.log("✅ Product Object Built");

    // 4. HANDLE SUBMISSION BASED ON PAYMENT METHOD
    if (paymentMethod === 'exempt' || paymentMethod === 'cod') {
      console.log("💰 COD/Exempt Flow");
      const newPendingProduct = new PendingProduct({
        ...productDataObject,
        status: 'pending',
        deliveryPaymentMethod: paymentMethod,
        deliveryPaymentStatus: paymentMethod === 'exempt' ? 'paid' : 'pending',
      });
      await newPendingProduct.save();
      console.log("✅ Pending Product Saved:", newPendingProduct._id);

      const message = paymentMethod === 'cod' 
        ? "Product submitted with Cash on Delivery"
        : "Product submitted for approval";

      return NextResponse.json({ 
        message, 
        success: true,
        product: newPendingProduct,
      });
    }

    if (paymentMethod === 'online') {
      console.log("💳 Online Payment Flow");
      const deliveryCost = parseFloat(formData.get('deliveryCost') as string);
      console.log("🔎 Delivery Cost:", deliveryCost);

      const options = {
        amount: deliveryCost * 100,
        currency: "INR",
        receipt: `prod_${Date.now()}_${sellerId.slice(-8)}`,
      };
      console.log("📤 Creating Razorpay Order");
      const order = await razorpay.orders.create(options);
      console.log("✅ Razorpay Order Created:", order.id);

      const newPendingProduct = new PendingProduct({
        ...productDataObject,
        status: 'awaiting-payment',
        deliveryCost,
        deliveryPaymentMethod: 'online',
        paymentOrderId: order.id,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      });

      await newPendingProduct.save();
      console.log("✅ Pending Product Saved with Awaiting Payment:", newPendingProduct._id);

      return NextResponse.json({
        success: true,
        paymentInitiated: true,
        order: order,
        product: newPendingProduct,
      });
    }

    console.log("❌ Invalid Payment Method");
    return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });

  } catch (error: any) {
    console.error("❌ Product upload error:", error);
    return NextResponse.json({ error: error.message || "Unknown server error" }, { status: 500 });
  }
}
