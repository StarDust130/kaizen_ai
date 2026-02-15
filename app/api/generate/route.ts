import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic, tone, audience, model } = await req.json();

    let systemPrompt = `You are a viral LinkedIn ghostwriter. 
    RULES:
    1. Start the post IMMEDIATELY with the hook. No titles (like "**Topic**"). No "As a...". No "Here is the post".
    2. Do NOT use bold headlines like "**The Daily Grind**". Just start writing the content.
    3. Use short, punchy paragraphs.`;

    if (tone === "Super Chill 🤙") {
      systemPrompt += `
      TONE: SUPER CHILL & GEN Z.
      - Use lowercase styling.
      - Use emojis (🚀, 💀, 🔥).
      - Use slang like "ngl", "fr", "lowkey".`;
    } else {
      systemPrompt += ` TONE: ${tone}.`;
    }

    const completion = await groq.chat.completions.create({
      model: model || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Topic: ${topic}\nTarget Audience: ${audience}`,
        },
      ],
      temperature: 0.8,
    });

    return Response.json({ content: completion.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "Failed to generate" }, { status: 500 });
  }
}
