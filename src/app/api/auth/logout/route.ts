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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
