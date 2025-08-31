import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({
            message: "Logout successful",
            success: true
        });

        // Clear the token cookie by setting it to an empty string and expiring immediately
        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        return response;
    } catch (error: unknown) { 
        // ✅ 2. Check if it's an instance of an Error
        if (error instanceof Error) {
            // Now TypeScript knows error has a 'message' property
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        // Handle cases where a non-Error was thrown
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}