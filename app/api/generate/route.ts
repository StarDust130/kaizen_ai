import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { topic, tone, audience, length, model } = await req.json();

  const completion = await groq.chat.completions.create({
    model: model || "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are KAIZEN_AI, a world-class LinkedIn ghostwriter. 
        Tone: ${tone}. Target Audience: ${audience}. 
        Rules: Use high-impact hooks, line breaks for readability, and relevant emojis. 
        Avoid corporate jargon unless requested.`,
      },
      { role: "user", content: `Write a ${length} post about: ${topic}` },
    ],
    temperature: 0.7, // Lower for consistency, higher for creativity
  });

  return Response.json({ content: completion.choices[0].message.content });
}
