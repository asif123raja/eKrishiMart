import  connect  from '@/dbConfig/dbConfig';
import Buyer from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from "bcryptjs";
import { sendEmail } from '@/helper/mailer';

export async function POST(request: NextRequest) {
    try {
        await connect();
        const reqBody = await request.json();
        
        // Validate required fields
        const requiredFields = ['username', 'email', 'password', 'pincode', 'city'];
        const missingFields = requiredFields.filter(field => !reqBody[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const { username, email, password, pincode, city } = reqBody;

        // Validate pincode format
        if (!/^\d{6}$/.test(pincode)) {
            return NextResponse.json(
                { error: "Invalid pincode format (6 digits required)" },
                { status: 400 }
            );
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check for existing user
        const existingUser = await Buyer.findOne({ email });


        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new buyer
        const newBuyer = new Buyer({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            pincode,
            city,
            addressLine1: reqBody.addressLine1 || undefined,
            addressLine2: reqBody.addressLine2 || undefined,
            state: reqBody.state || undefined
        });

        const savedBuyer = await newBuyer.save();

        // Send verification email
        await sendEmail({ 
            email, 
            emailType: "VERIFY", 
            userId: savedBuyer._id 
        });

        return NextResponse.json({
            message: "Buyer account created successfully",
            success: true,
            buyer: {
                id: savedBuyer._id,
                email: savedBuyer.email
            }
        });

    } catch (error: unknown) {
    console.error('Signup Error:', error);

    // 1. Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json(
            { 
                error: "Registration failed",
                // 2. Your conditional logic is now safely inside the type guard
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            },
            { status: 500 }
        );
    }

    // 3. Fallback for cases where a non-Error was thrown
    return NextResponse.json(
        {
            error: "An unknown registration error occurred"
        },
        { status: 500 }
    );
}
}