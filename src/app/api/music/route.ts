import { NextRequest } from "next/server";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { prompt, lyrics, isInstrumental } = await request.json();

    const payload: Record<string, unknown> = {
      model: "music-2.6",
      prompt,
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: "mp3",
      },
      output_format: "url",
    };

    if (isInstrumental) {
      payload.is_instrumental = true;
    } else if (lyrics) {
      payload.lyrics = lyrics;
    } else {
      payload.lyrics_optimizer = true;
    }

    const res = await fetch("https://api.minimaxi.com/v1/music_generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Music API error: ${res.status} ${errText}` },
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
