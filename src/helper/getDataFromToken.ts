// helper/getDataFromToken.ts
// import { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// interface TokenPayload {
//     id: string;
//     email: string;
//     userType: 'buyer' | 'seller' | 'manager';
//     pincode?: string;
//     warehouseId?: string;
// }

// export const getDataFromToken = (request: NextRequest): TokenPayload => {
//     try {
//         const token = request.cookies.get("token")?.value || '';
//         const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenPayload;
//         return decoded;
//     } catch (error: any) {
//         throw new Error(error.message || "Invalid token");
//     }
// };

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  userType: "buyer" | "seller" | "manager";
  pincode?: string;
  warehouseId?: string;
}

export function getDataFromToken(request: NextRequest): TokenPayload | null {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenPayload;
    return decoded;
  } catch (error: any) {
    console.error("Error verifying token:", error.message);
    return null;
  }
}
