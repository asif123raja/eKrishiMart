import connect from '@/dbConfig/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import Seller from '@/models/sellerModel';

// connect();

export async function POST(request: NextRequest) {
    try {
        await connect();
        const reqBody = await request.json();
        const { token } = reqBody;

        if (!token) {
            return NextResponse.json({ error: "Token is missing" }, { status: 400 });
        }
        console.log("--- VERIFY EMAIL API HIT ---");
        console.log("Token received from frontend:", token);
        // Find the seller with the matching token that hasn't expired
        const seller = await Seller.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() }
        });

        if (!seller) {
            console.log("!!! No seller found with this token or token has expired.");
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }
        

        console.log("Seller found for verification:", seller);

        // Update seller to be verified and clear the token fields
        seller.isVerified = true;
        seller.verifyToken = undefined;
        seller.verifyTokenExpiry = undefined;
        await seller.save();
        console.log("✅ Seller email verified and token cleared.");
        return NextResponse.json({
            message: "Email verified successfully!",
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}