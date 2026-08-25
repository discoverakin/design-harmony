const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

// Pin the model. The previous value (claude-sonnet-4-20250514) was retired on
// 2026-06-15, so every request 404'd and the quiz silently served
// DEFAULT_RESPONSE — the same canned three hobbies for every user.
const QUIZ_MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You are a hobby recommendation engine for Discover Akin, a creative studio marketplace in Ann Arbor. Based on a user's quiz answers, generate personalized hobby recommendations. You have access to ALL of these hobbies:
cooking, arts-crafts, pottery, knitting, coding, dance, music.

Return ONLY a JSON object with no markdown:
{
  "personality_summary": string, // 2 warm sentences describing this person's creative personality
  "recommendations": [
    {
      "slug": string,            // hobby slug from the list above
      "reason": string           // 1 sentence why this hobby fits them personally
    }
  ]  // exactly 3 recommendations, most relevant first
}`;

const QUESTIONS = [
  "How do you like to spend a free afternoon?",
  "What sounds most exciting to learn?",
  "Pick your ideal group setting:",
  "What motivates you most?",
  "Pick a weekend vibe:",
];

const DEFAULT_RESPONSE = {
  personality_summary:
    "You're a curious and creative soul who loves trying new things. Your energy and openness make you a natural fit for hands-on experiences.",
  recommendations: [
    { slug: "arts-crafts", reason: "Your creative side will thrive with hands-on art projects." },
    { slug: "cooking", reason: "Exploring new recipes is a perfect way to express your curiosity." },
    { slug: "knitting", reason: "A calming, meditative craft to balance your adventurous spirit." },
  ],
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body;
  if (!answers || !Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: "Expected exactly 5 answers" });
  }

  const userMessage = `Here are my quiz answers:\n${QUESTIONS.map(
    (q, i) => `Q${i + 1} - ${q} ${answers[i]}`
  ).join("\n")}`;

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: QUIZ_MODEL,
        max_tokens: 1024,
        // Recommendation, not deep reasoning — and adaptive thinking is on by
        // default on this model, which would eat into max_tokens.
        thinking: { type: "disabled" },
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      console.error(
        `[quiz] Claude call failed: ${apiRes.status} ${apiRes.statusText} ${detail.slice(0, 300)}`
      );
      return res.status(200).json(DEFAULT_RESPONSE);
    }

    const data = await apiRes.json();
    const text = data.content?.find((block: { type?: string }) => block?.type === "text")?.text;
    if (!text) {
      console.error("[quiz] Claude returned no text block:", JSON.stringify(data).slice(0, 300));
      return res.status(200).json(DEFAULT_RESPONSE);
    }

    const parsed = JSON.parse(text);
    return res.status(200).json({
      personality_summary: parsed.personality_summary,
      recommendations: parsed.recommendations,
    });
  } catch (err) {
    console.error("[quiz] Claude call threw — serving default recommendations:", err);
    return res.status(200).json(DEFAULT_RESPONSE);
  }
}
