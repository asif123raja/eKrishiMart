// AIzaSyBUXZ7Dz42gDP9JM_frEwudTNp14DNuk1Y
//AIzaSyCJidV_cX7J8wUYAj9kQS4NnQf-p573RpA
// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiKey = "AIzaSyBUXZ7Dz42gDP9JM_frEwudTNp14DNuk1Y"; // Use .env.local
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to call Gemini API' }, { status: 500 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    return NextResponse.json({ response: text });
  } catch (error: any) { // Rename to 'error' and type as 'any'
    console.error("Error calling Gemini API:", error); // Log the actual error
    return NextResponse.json({ error: 'Internal error: ' + error.message }, { status: 500 });
}
}
