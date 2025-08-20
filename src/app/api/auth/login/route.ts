// import connect  from '@/dbConfig/dbConfig';
// import Buyer from '@/models/userModel';
// import Seller from '@/models/sellerModel';
// import { NextRequest, NextResponse } from 'next/server';
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";

// connect();

// export async function POST(request: NextRequest) {
//     try {
//         const reqBody = await request.json();
//         const { email, password } = reqBody;

//         // Check in both buyer and seller collections
//         const buyer = await Buyer.findOne({ email });
//         const seller = await Seller.findOne({ email });

//         const user = buyer || seller;
//         console.log("here is the first clg: ",user._id);
//         const userType = buyer ? 'buyer' : 'seller';

//         if (!user) {
//             return NextResponse.json(
//                 { error: "User not found" },
//                 { status: 400 }
//             );
//         }

//         // Verify password
//         const validPassword = await bcryptjs.compare(password, user.password);
//         if (!validPassword) {
//             return NextResponse.json(
//                 { error: "Invalid password" },
//                 { status: 400 }
//             );
//         }

//         // Create token data
//         const tokenData = {
//             id: user._id,
//             email: user.email,
//             userType: userType,
//             pincode: user.pincode
//         };

//         // Create token
//         const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
//             expiresIn: "1d"
//         });

//         const response = NextResponse.json({
//             message: "Login successful",
//             success: true,
//             userType,
//             token,
//         });

//         // Set cookie
//         response.cookies.set("token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             maxAge: 86400 // 1 day
//         });

//         return response;

//     } catch (error: any) {
//         return NextResponse.json(
//             { error: error.message || "Internal server error" },
//             { status: 500 }
//         );
//     }
// }
import connect from '@/dbConfig/dbConfig';
import Buyer from '@/models/userModel';
import Seller from '@/models/sellerModel';
import Warehouse from '@/models/warehouseModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {
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
            user = seller;
            userType = 'seller';
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

        const tokenData: { id: string; email: string; userType: string; pincode?: string; warehouseId?: string } = {
            id: user._id,
            email: user.email,
            userType: userType,
        };
        
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

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}