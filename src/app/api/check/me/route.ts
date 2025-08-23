
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