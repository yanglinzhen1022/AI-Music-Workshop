import { NextRequest } from "next/server";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    const res = await fetch("https://api.minimaxi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "system",
            content: `你是一位专业的音乐制作人和词曲创作者。用户会给你一个主题或心情描述，你需要：
1. 根据描述扩展出一个更详细的歌曲创意构思（2-3句话）
2. 推荐合适的音乐风格标签（中文，用逗号分隔，如 "流行, 欢快, 女声"）
3. 建议一个歌曲名称

请严格按照以下 JSON 格式返回，不要包含其他内容：
{"concept": "创意构思", "tags": "风格标签", "title": "歌曲名称"}`,
          },
          {
            role: "user",
            content: theme,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `MiniMax API error: ${res.status} ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || "";

    // MiniMax-M2 may wrap response in <think>...</think> tags
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { concept: content, tags: "", title: "" };
    } catch {
      parsed = { concept: content, tags: "", title: "" };
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}
