import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic, tone, audience, length, type, model } = await req.json();

    const prompt = `
    ACT AS: A world-class LinkedIn ghostwriter.
    TASK: Write a ${type} about "${topic}".
    TONE: ${tone}.
    AUDIENCE: ${audience}.
    LENGTH: ${length}.
    
    FORMATTING RULES:
    1. Use short, punchy sentences.
    2. Use line breaks between every thought.
    3. No corporate jargon.
    4. Start with a scroll-stopping hook.
    5. End with a question.
    `;

    const completion = await groq.chat.completions.create({
      model: model || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return Response.json({ content: completion.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
