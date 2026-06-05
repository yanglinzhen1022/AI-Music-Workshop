import { NextRequest } from "next/server";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { prompt, title } = await request.json();

    const res = await fetch("https://api.minimaxi.com/v1/lyrics_generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        mode: "write_full_song",
        prompt,
        ...(title ? { title } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Lyrics API error: ${res.status} ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}
