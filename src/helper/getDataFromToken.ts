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
  } catch (error: unknown) {
    if (error instanceof Error) {
        // This is safe because we've confirmed it's a standard error
        console.error("Error verifying token:", error.message);
    } else {
        // Handle cases where a non-Error was thrown
        console.error("An unknown error occurred during token verification:", error);
    }
    return null;
  }
}
