import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic, tone, audience, model, postLength, hookStyle } =
      await req.json();

    // Length instructions
    const lengthMap: Record<string, string> = {
      short:
        "Keep the post SHORT (3-5 lines max). Extremely punchy and concise.",
      medium:
        "Write a MEDIUM-length post (8-12 lines). Well-structured with clear paragraphs.",
      long: "Write a LONG, DETAILED post (15-20 lines). Deep dive with examples and insights.",
    };
    const lengthInstruction = lengthMap[postLength] || lengthMap.medium;

    // Hook style instructions
    const hookMap: Record<string, string> = {
      bold_statement:
        "Start with a BOLD, PROVOCATIVE statement that challenges conventional thinking.",
      question:
        "Start with a THOUGHT-PROVOKING question that makes readers stop scrolling.",
      statistic:
        "Start with a SURPRISING statistic or number that grabs attention.",
      story: "Start with a SHORT, RELATABLE personal anecdote (1-2 sentences).",
      contrarian:
        "Start with a CONTRARIAN opinion that goes against popular belief.",
      auto: "Choose the best hook style for this topic.",
    };
    const hookInstruction = hookMap[hookStyle] || hookMap.auto;

    let systemPrompt = `You are a viral LinkedIn ghostwriter. 
    RULES:
    1. Start the post IMMEDIATELY with the hook. No titles (like "**Topic**"). No "As a...". No "Here is the post".
    2. Do NOT use bold headlines like "**The Daily Grind**". Just start writing the content.
    3. Use short, punchy paragraphs.
    4. ${lengthInstruction}
    5. HOOK: ${hookInstruction}
    6. End with a clear call to action or question to drive engagement.
    7. Use line breaks between paragraphs for readability.`;

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
