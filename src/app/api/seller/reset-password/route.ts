// import { NextRequest, NextResponse } from 'next/server';
// import connect from '@/dbConfig/dbConfig';
// import Seller from '@/models/sellerModel';
// import { sendEmail } from '@/helper/mailer';
// import crypto from 'crypto';

// connect();

// export async function POST(request: NextRequest) {
//     try {
//         console.log("🔹 Incoming password reset request...");
//         await connect();
//         console.log("✅ Database connected");

//         const { email } = await request.json();
//         console.log("📩 Email received from request:", email);

//         const user = await Seller.findOne({ email });
//         console.log("🔍user email:",email, " User lookup result:", user ? "User found" : "No user found");

//         if (!user) {
//             console.log("⚠️ No account with this email exists");
//             return NextResponse.json(
//                 { message: "If an account with this email exists, a password reset link has been sent." },
//                 { status: 200 }
//             );
//         }

//         // 1. Create the RAW token
//         const resetToken = crypto.randomBytes(32).toString("hex");
//         console.log("🔑 Raw reset token generated:", resetToken);

//         // 2. HASH the token
//         user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//         user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
//         console.log("🔒 Hashed token stored in DB:", user.resetPasswordToken);
//         console.log("⏰ Token expiry set to:", new Date(user.resetPasswordTokenExpiry));

//         await user.save();
//         console.log("✅ User updated with reset token and expiry");

//         // 3. Send the RAW token in email
//         await sendEmail({
//             email: user.email,
//             emailType: "RESET",
//             userId: user._id,
//             token: resetToken 
//         });
//         console.log("📧 Reset email sent to:", user.email);

//         return NextResponse.json(
//             { message: "If an account with this email exists, a password reset link has been sent." },
//             { status: 200 }
//         );

//     } catch (error: any) {
//         console.error("❌ Error in password reset route:", error.message);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Seller from '@/models/sellerModel';
import crypto from 'crypto';


export async function POST(request: NextRequest) {
    try {
        await connect();
            console.log("✅ DB Connected");
        console.log("🔹 Incoming RESET PASSWORD request...");
        await connect();
        
        const { token, password } = await request.json();
        console.log("📩 Received token:", token);
        console.log("📩 Received password length:", password.length);

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        // Hash the received token
        const hashedReceivedToken = crypto.createHash("sha256").update(token).digest("hex");
        console.log("🔍 Hashed received token:", hashedReceivedToken);

        // Find user with matching token that's not expired
        const user = await Seller.findOne({
            resetPasswordToken: hashedReceivedToken,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.log("❌ No user found with this token");
            
            // Let's check what tokens actually exist in DB for debugging
            const allUsersWithTokens = await Seller.find({
                resetPasswordToken: { $exists: true },
                resetPasswordTokenExpiry: { $gt: Date.now() }
            });
            
            console.log("🔍 Active tokens in DB:", allUsersWithTokens.map(u => ({
                email: u.email,
                token: u.resetPasswordToken,
                expiry: new Date(u.resetPasswordTokenExpiry)
            })));
            
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        console.log("✅ Valid token found for user:", user.email);

        // Update password and clear reset token
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
        
        await user.save();
        console.log("✅ Password updated successfully");

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );

    } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}