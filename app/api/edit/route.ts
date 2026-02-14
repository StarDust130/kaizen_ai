import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { currentText, action, topic } = await req.json();

    let instruction = "";
    if (action === "shorten")
      instruction =
        "Make this LinkedIn post 50% shorter. Keep the hook. Remove fluff.";
    if (action === "refine")
      instruction =
        "Improve the clarity and punchiness of this post. Fix grammar. Make it sound more professional.";
    if (action === "retry")
      instruction = "Rewrite this post completely with a fresh perspective.";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert editor. Output ONLY the updated post text.",
        },
        {
          role: "user",
          content: `Original Topic: ${topic}\n\nCurrent Text:\n${currentText}\n\nTask: ${instruction}`,
        },
      ],
      temperature: 0.7,
    });

    return Response.json({ content: completion.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "Edit failed" }, { status: 500 });
  }
}
