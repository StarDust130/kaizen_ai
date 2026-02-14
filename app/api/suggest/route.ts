import { Groq } from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text) return Response.json({ suggestion: "" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Complete the sentence with 2-4 words. Output ONLY text.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 6,
    });
    return Response.json({ suggestion: completion.choices[0].message.content });
  } catch (e) {
    return Response.json({ suggestion: "" });
  }
}
