import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { currentText, action, topic, selectedText, instruction } =
      await req.json();

    let systemPrompt =
      "You are an expert editor. Output ONLY the updated post text.";
    let userPrompt = "";

    if (action === "custom_selection" && selectedText && instruction) {
      // Custom selection edit — return ONLY the replacement text
      systemPrompt =
        "You are an expert LinkedIn post editor. The user selected a specific part of their post and gave an instruction. Output ONLY the replacement text for the selected portion. Do NOT output the full post. Do NOT add quotes, labels, or explanation. Just the replacement text.";
      userPrompt = `Selected text from the post:\n"${selectedText}"\n\nUser instruction: ${instruction}\n\nOutput ONLY the new replacement text for the selected portion. Nothing else.`;
    } else {
      let editInstruction = "";
      if (action === "shorten")
        editInstruction =
          "Make this LinkedIn post 50% shorter. Keep the hook. Remove fluff.";
      if (action === "refine")
        editInstruction =
          "Improve the clarity and punchiness of this post. Fix grammar. Make it sound more professional.";
      if (action === "retry")
        editInstruction =
          "Rewrite this post completely with a fresh perspective.";
      if (action === "add_hashtags")
        editInstruction =
          "Add 3-5 relevant, trending LinkedIn hashtags at the end of this post. Keep the original text exactly the same. Only add hashtags.";
      if (action === "add_emoji")
        editInstruction =
          "Add relevant emojis throughout this post to make it more engaging and visually appealing. Don't overdo it — 4-6 emojis max. Keep the text meaning the same.";
      if (action === "add_cta")
        editInstruction =
          "Add a strong call-to-action at the end of this post. Something that drives engagement — ask a question, invite comments, or encourage sharing. Keep the original text and just add a compelling ending.";

      userPrompt = `Original Topic: ${topic}\n\nCurrent Text:\n${currentText}\n\nTask: ${editInstruction}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    return Response.json({ content: completion.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "Edit failed" }, { status: 500 });
  }
}
