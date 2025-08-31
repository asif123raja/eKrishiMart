// import connect from '@/dbConfig/dbConfig';
// import Buyer from '@/models/userModel';
// import Seller from '@/models/sellerModel';
// import Warehouse from '@/models/warehouseModel';
// import { NextRequest, NextResponse } from 'next/server';
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";

// connect();

// export async function POST(request: NextRequest) {
//     try {
//         const reqBody = await request.json();
//         const { email, password } = reqBody;

//         const buyer = await Buyer.findOne({ email });
//         const seller = await Seller.findOne({ email });
//         const warehouse = await Warehouse.findOne({ 'manager.email': email });

//         let user;
//         let userType: 'buyer' | 'seller' | 'manager';

//         if (buyer) {
//             user = buyer;
//             userType = 'buyer';
//         } else if (seller) {


//             // --- THIS IS THE KEY MODIFICATION ---
//             if (!seller.isVerified) {
//                 return NextResponse.json(
//                     { error: "Please verify your email before logging in." },
//                     { status: 403 } // 403 Forbidden is more appropriate here
//                 );
//             }
//             // ------------------------------------
//             user = seller;
//             userType = 'seller';


//             // user = seller;
//             // userType = 'seller';
//         } else if (warehouse) {
//             user = warehouse.manager;
//             user._id = warehouse._id; 
//             userType = 'manager';
//         } else {
//             return NextResponse.json(
//                 { error: "User not found" },
//                 { status: 400 }
//             );
//         }

//         const validPassword = await bcryptjs.compare(password, user.password);
//         if (!validPassword) {
//             return NextResponse.json(
//                 { error: "Invalid password" },
//                 { status: 400 }
//             );
//         }

//         const tokenData: { id: string; email: string; userType: string; pincode?: string; warehouseId?: string; isVerified?: boolean } = {
//             id: user._id,
//             email: user.email,
//             userType: userType,
//             isVerified: user.isVerified,
//         };
//         // --- Step 3: CRITICAL - Perform Authorization Checks (like verification) ---
//         if (userType === 'seller' && !user.isVerified) {
//             // ✅ RETURN IMMEDIATELY. DO NOT PROCEED TO TOKEN CREATION.
//             return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
//         }
        
//         if (userType === 'buyer' || userType === 'seller') {
//             tokenData.pincode = user.businessAddress?.pincode;
//         } else if (userType === 'manager') {
//             tokenData.warehouseId = warehouse._id;
//         }

//         const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
//             expiresIn: "1d"
//         });

//         // ✅ NEW: Define the redirect path based on the user's role
//         const redirectPath = `/${userType}/profile`;

//         const response = NextResponse.json({
//             message: "Login successful",
//             success: true,
//             userType,
//             token,
//             redirectPath: redirectPath,
//             userEmail: user.email,
//             userId: user._id, // ✅ NEW: Add the path to the response
//         });

//         response.cookies.set("token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             maxAge: 86400 // 1 day
//         });

//         return response;

//     } catch (error: unknown) { // 1. Catch as 'unknown'
//     // 2. Check if it's an instance of Error
//     if (error instanceof Error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//     // 3. Handle non-Error exceptions
//        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
//     }
// }
import connect from '@/dbConfig/dbConfig';
import Buyer from '@/models/userModel';
import Seller from '@/models/sellerModel';
import Warehouse from '@/models/warehouseModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// connect();

export async function POST(request: NextRequest) {
    try {
        await connect();
        const reqBody = await request.json();
        const { email, password } = reqBody;

        const buyer = await Buyer.findOne({ email });
        const seller = await Seller.findOne({ email });
        const warehouse = await Warehouse.findOne({ 'manager.email': email });

        let user;
        let userType: 'buyer' | 'seller' | 'manager';

        if (buyer) {
            user = buyer;
            userType = 'buyer';
        } else if (seller) {


            // --- THIS IS THE KEY MODIFICATION ---
            if (!seller.isVerified) {
                return NextResponse.json(
                    { error: "Please verify your email before logging in." },
                    { status: 403 } // 403 Forbidden is more appropriate here
                );
            }
            // ------------------------------------
            user = seller;
            userType = 'seller';


            // user = seller;
            // userType = 'seller';
        } else if (warehouse) {
            user = warehouse.manager;
            user._id = warehouse._id; 
            userType = 'manager';
        } else {
            return NextResponse.json(
                { error: "User not found" },
                { status: 400 }
            );
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 400 }
            );
        }

        const tokenData: { id: string; email: string; userType: string; pincode?: string; warehouseId?: string; isVerified?: boolean } = {
            id: user._id,
            email: user.email,
            userType: userType,
            isVerified: user.isVerified,
        };
        // --- Step 3: CRITICAL - Perform Authorization Checks (like verification) ---
        if (userType === 'seller' && !user.isVerified) {
            // ✅ RETURN IMMEDIATELY. DO NOT PROCEED TO TOKEN CREATION.
            return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
        }
        
        if (userType === 'buyer' || userType === 'seller') {
            tokenData.pincode = user.businessAddress?.pincode;
        } else if (userType === 'manager') {
            tokenData.warehouseId = warehouse._id;
        }

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
            expiresIn: "1d"
        });

        // ✅ NEW: Define the redirect path based on the user's role
        const redirectPath = `/${userType}/profile`;

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            userType,
            token,
            redirectPath: redirectPath,
            userEmail: user.email,
            userId: user._id, // ✅ NEW: Add the path to the response
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400 // 1 day
        });

        return response;

    } catch (error: unknown) { // 1. Catch as 'unknown'
    // 2. Check if it's an instance of Error
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // 3. Handle non-Error exceptions
       return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}