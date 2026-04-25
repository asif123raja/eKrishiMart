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





export async function POST(request: NextRequest) {
  try {
    await connect();
    console.log("✅ DB Connected");
    console.log("🚀 API Called: Product Upload");

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Missing Cloudinary configuration" }, { status: 500 });
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary Configured");

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
      return NextResponse.json({ error: "Missing Razorpay configuration" }, { status: 500 });
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_ID,
    });
    console.log("✅ Razorpay Configured");

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

  } catch (error: unknown) {
    console.error("❌ Product upload error:", error);

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message || "Unknown server error" }, { status: 500 });
    }
    
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
}
}
