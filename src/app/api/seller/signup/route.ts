import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
import Warehouse from '@/models/warehouseModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from "bcryptjs";
import { sendEmail } from '@/helper/mailer';

connect();

// Helper function to generate SKU
function generateSku() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = 'SKU-';
  for (let i = 0; i < 8; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    console.log("Incoming seller request body:", reqBody);

    const {
      username,
      email,
      password,
      businessName,
      contactNumber,
      businessAddress,
      gstNumber,
      fssaiLicense,
      pincode
    } = reqBody;

    // Basic validation
    if (
      !username || !email || !password || !businessName || !contactNumber ||
      !businessAddress || !businessAddress.addressLine1 || !businessAddress.city ||
      !businessAddress.state || !pincode || !gstNumber
    ) {
      console.log("Missing required fields")
      return NextResponse.json(
        
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate pincode format: must be exactly 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      console.log("Invalid pincode format. Must be a 6-digit number.")
      return NextResponse.json(
        { error: "Invalid pincode format. Must be a 6-digit number." },
        { status: 400 }
      );
    }

    // GST validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      return NextResponse.json(
        { error: "Invalid GST number format" },
        { status: 400 }
      );
    }

    // Check for existing seller by email or GST
    const existingSeller = await Seller.findOne({
      $or: [{ email: email.toLowerCase() }, { gstNumber }]
    });
    if (existingSeller) {
      console.log("Seller with this email or GST already exists")
      return NextResponse.json(
        { error: "Seller with this email or GST already exists" },
        { status: 400 }
      );
    }

    // Generate unique SKU
    let sku = generateSku();
    while (await Seller.findOne({ sku })) {
      sku = generateSku();
    }

    // Find warehouse by exact pincode
    const warehouse = await Warehouse.findOne({ serviceablePincodes: pincode });
    if (!warehouse) {
      console.log("Warehouse not found for the provided pincode.")
      return NextResponse.json(
        { error: "Warehouse not found for the provided pincode." },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new seller
    const newSeller = new Seller({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName,
      contactNumber,
      sku,
      businessAddress: {
        ...businessAddress,
        pincode,
        coordinates: [0, 0] // Placeholder, replace if you have geolocation logic
      },
      gstNumber,
      fssaiLicense,
      warehouseId: warehouse._id
    });

    const savedSeller = await newSeller.save();

    // Send verification email
    await sendEmail({
      email: savedSeller.email,
      emailType: "VERIFY",
      userId: savedSeller._id
    });
    console.log("access 1")
    return NextResponse.json({
      message: "Seller account created successfully",
      success: true,
      seller: {
        id: savedSeller._id,
        businessName: savedSeller.businessName,
        email: savedSeller.email,
        sku: savedSeller.sku
      }
    });

  } catch (error: any) {
    console.log("problem here at catch");
    console.error("Error creating seller:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
