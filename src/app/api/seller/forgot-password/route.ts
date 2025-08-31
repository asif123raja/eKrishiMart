import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
import { sendEmail } from '@/helper/mailer';
import crypto from 'crypto';

connect();

export async function POST(request: NextRequest) {
    try {
        console.log("🔹 Incoming FORGOT PASSWORD request...");
        await connect();
        
        const { email } = await request.json();
        console.log("📩 Email received:", email);

        const user = await Seller.findOne({ email });
        if (!user) {
            console.log("⚠️ No account with this email exists");
            return NextResponse.json(
                { message: "If an account with this email exists, a password reset link has been sent." },
                { status: 200 }
            );
        }

        // Create the RAW token
        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log("🔑 RAW token:", resetToken);
        
        // HASH the token for database storage
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        console.log("🔒 HASHED token:", hashedToken);

        user.resetPasswordToken = hashedToken;
        user.resetPasswordTokenExpiry = Date.now() + 3600000;
        
        await user.save();
        console.log("✅ Token saved to database");

        // Send the RAW token in email
        await sendEmail({
            email: user.email,
            emailType: "RESET",
            userId: user._id,
            token: resetToken 
        });
        console.log("📧 Email sent with RAW token");

        return NextResponse.json(
            { message: "If an account with this email exists, a password reset link has been sent." },
            { status: 200 }
        );

    } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        console.error("❌ Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Fallback for cases where a non-Error was thrown
    console.error("❌ Unknown Error:", error);
    return NextResponse.json({ error: "An unknown server error occurred" }, { status: 500 });
}
}