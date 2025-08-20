
import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
import PendingProduct from '@/models/pendingProductModel';
import Warehouse from '@/models/warehouseModel';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

connect();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }

    let sellerId: string;
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
      sellerId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const formData = await request.formData();
    
    // ✅ NEW: Read and validate the expiryDate from the form
    const expiryDateRaw = formData.get('expiryDate') as string | null;
    if (!expiryDateRaw) {
      return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
    }
    const expiryDate = new Date(expiryDateRaw);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
    }

    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const category = formData.get('category') as string;
    const variety = formData.get('variety') as string;
    if (!category || !variety) {
      return NextResponse.json({ error: "Category and variety are required" }, { status: 400 });
    }

    // Generate SKU
    const skuPrefix = seller.sku || sellerId.slice(-4).toUpperCase(); // fallback if sku missing
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const varietyCode = variety.substring(0, 3).toUpperCase();
    const timeSuffix = Date.now().toString().slice(-4);
    const fullSku = `${skuPrefix}-${categoryPrefix}-${varietyCode}-${timeSuffix}`;

    // Upload image
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Build nested fields
    const vitamins = {
      vitamin_A: formData.get('vitaminA') as string || '0',
      vitamin_C: formData.get('vitaminC') as string || '0',
      vitamin_K: formData.get('vitaminK') as string || '0',
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

    // Find warehouse by seller pincode
        // Find warehouse by seller pincode
    const sellerPincode = seller.businessAddress?.pincode;
    const sellerAddress = seller.businessAddress; // Correctly reference the address object

    const warehouse = await Warehouse.findOne({ serviceablePincodes: sellerPincode });
    if (!warehouse) {
      return NextResponse.json({ error: "No warehouse found for seller's pincode" }, { status: 400 });
    }

    // Build and save pending product
    const newPendingProduct = new PendingProduct({
      sellerId,
      sku: fullSku,
      name: formData.get('name'),
      category,
      variety,
      description: formData.get('description'),
      nutrition,
      vitamins,
      minerals,
      pricing,
      imageUrl: (cloudinaryResult as any).secure_url,
      itemQuantity: parseInt(formData.get('itemQuantity') as string || '0'),
      expiryDate, // ✅ NEW: Persist the validated expiryDate
      sellerPincode,
      sellerAddress,
      warehouseId: warehouse._id,
      approved: false,
    });

    const savedPendingProduct = await newPendingProduct.save();

    return NextResponse.json({
      message: "Product submitted for approval",
      success: true,
      product: savedPendingProduct,
    });

  } catch (error: any) {
    console.error("Product upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}