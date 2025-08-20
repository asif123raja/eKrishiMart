// import { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// // ✅ NEW: A more detailed interface that matches the data in your token
// interface TokenPayload {
//     id: string;
//     email: string;
//     userType: 'buyer' | 'seller' | 'manager';
//     pincode?: string;
//     warehouseId?: string;
//     // iat and exp are automatically added by jwt
//     iat?: number;
//     exp?: number;
// }

// // ✅ CHANGED: The function now returns the entire TokenPayload object
// export const getDataFromToken = (request: NextRequest): TokenPayload => {
//     try {
//         // Fetch the token from cookies
//         const token = request.cookies.get("token")?.value;
//         if (!token) {
//             throw new Error("Token not found in cookies");
//         }

//         // Verify and decode token
//         const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenPayload;

//         // ✅ CHANGED: Return the entire decoded object
//         return decodedToken;
        
//     } catch (error: any) {
//         console.error("Token verification failed:", error.message);
//         throw new Error(error.message || "Invalid token");
//     }
// };


// helper/getDataFromToken.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id: string;
    email: string;
    userType: 'buyer' | 'seller' | 'manager';
    pincode?: string;
    warehouseId?: string;
}

export const getDataFromToken = (request: NextRequest): TokenPayload => {
    try {
        const token = request.cookies.get("token")?.value || '';
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenPayload;
        return decoded;
    } catch (error: any) {
        throw new Error(error.message || "Invalid token");
    }
};