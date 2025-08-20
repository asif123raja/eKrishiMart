// import { getDataFromToken } from "@/helper/getDataFromToken";
// import { NextRequest, NextResponse } from "next/server";
// import Buyer from "@/models/userModel";
// import connect from "@/dbConfig/dbConfig";

// connect();

// export async function GET(request: NextRequest) {
//     try {
//         // Extract user ID from token
//         const userId = await getDataFromToken(request);
//         console.log("userid here it is",userId)
//         if (!userId) {
//             throw new Error("Invalid token or user ID not found");
//         }

//         // Fetch user details
//         console.log("accesee 22")
//         const user = await Buyer.findOne({ _id: userId }).select("-password");
//         if (!user) {
//             throw new Error("User not found");
//         }
//         const role="User";
//         console.log(user)
//         return NextResponse.json({
//             message: "User found",
//             data: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.name,  // Include necessary fields
//                 role: role,       // Adding role dynamically
//             }
            
//         });

//     } catch (error: any) {
//         console.error("Error fetching user details:", error.message);
//         return NextResponse.json({ error: error.message }, { status: 400 });
//     }
// }


import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/helper/getDataFromToken';

// This helper is assumed to exist from your previous setup.
// It should get the token from cookies and decode it.

export async function GET(request: NextRequest) {
  try {
    // Decode the token to get the user's data payload
    const decodedToken = await getDataFromToken(request);

    if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Return the decoded data, which includes the userType
    return NextResponse.json({
        message: "User data found",
        data: decodedToken,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}