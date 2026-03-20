import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

// Static hobby catalog — kept lean for the prompt
const HOBBIES = [
  { slug: "arts-crafts", label: "Arts & Crafts", emoji: "🎨", difficulty: "Beginner", tags: ["painting","drawing","pottery","sculpture","creative","diy"] },
  { slug: "music", label: "Music", emoji: "🎵", difficulty: "Intermediate", tags: ["guitar","piano","drums","singing","instrument","production"] },
  { slug: "photography", label: "Photography", emoji: "📸", difficulty: "Beginner", tags: ["camera","photo","portrait","landscape","editing","street photography"] },
  { slug: "knitting", label: "Knitting & Crochet", emoji: "🧶", difficulty: "Beginner", tags: ["yarn","sewing","embroidery","textile","fiber arts","macrame"] },
  { slug: "pottery", label: "Pottery & Ceramics", emoji: "🏺", difficulty: "Beginner", tags: ["clay","wheel throwing","sculpting","glazing","ceramics"] },
  { slug: "woodworking", label: "Woodworking", emoji: "🪵", difficulty: "Intermediate", tags: ["carpentry","furniture","carving","diy","tools"] },
  { slug: "film-making", label: "Film & Video", emoji: "🎬", difficulty: "Intermediate", tags: ["video editing","directing","cinema","youtube","animation"] },
  { slug: "sports", label: "Sports", emoji: "⚽", difficulty: "Beginner", tags: ["soccer","basketball","tennis","volleyball","team","fitness"] },
  { slug: "yoga", label: "Yoga & Meditation", emoji: "🧘", difficulty: "Beginner", tags: ["mindfulness","stretching","flexibility","wellness","relaxation"] },
  { slug: "dance", label: "Dance", emoji: "💃", difficulty: "Beginner", tags: ["salsa","hip hop","ballet","contemporary","latin","swing"] },
  { slug: "hiking", label: "Hiking & Outdoors", emoji: "🥾", difficulty: "Beginner", tags: ["trails","nature","camping","trekking","adventure"] },
  { slug: "fitness", label: "Fitness & Gym", emoji: "💪", difficulty: "Beginner", tags: ["weightlifting","crossfit","running","cycling","cardio","strength"] },
  { slug: "swimming", label: "Swimming", emoji: "🏊", difficulty: "Beginner", tags: ["pool","water sports","diving","snorkeling","triathlon"] },
  { slug: "martial-arts", label: "Martial Arts", emoji: "🥋", difficulty: "Intermediate", tags: ["karate","boxing","mma","self-defense","jiu-jitsu"] },
  { slug: "rock-climbing", label: "Rock Climbing", emoji: "🧗", difficulty: "Intermediate", tags: ["bouldering","climbing gym","outdoor climbing","belaying"] },
  { slug: "board-sports", label: "Skateboarding & Surfing", emoji: "🛹", difficulty: "Intermediate", tags: ["skateboard","surfing","snowboarding","longboard"] },
  { slug: "cooking", label: "Cooking", emoji: "👨‍🍳", difficulty: "Beginner", tags: ["baking","cuisine","recipe","chef","food","grilling","pastry"] },
  { slug: "gaming", label: "Gaming", emoji: "🎮", difficulty: "Beginner", tags: ["video games","board games","tabletop","rpg","esports","strategy"] },
  { slug: "gardening", label: "Gardening", emoji: "🌱", difficulty: "Beginner", tags: ["plants","flowers","vegetables","herbs","indoor plants","organic"] },
  { slug: "volunteering", label: "Volunteering", emoji: "🤝", difficulty: "Beginner", tags: ["community service","charity","nonprofit","social impact","mentoring"] },
  { slug: "reading", label: "Reading", emoji: "📚", difficulty: "Beginner", tags: ["books","fiction","non-fiction","book club","audiobooks","poetry"] },
  { slug: "writing", label: "Writing", emoji: "✍️", difficulty: "Beginner", tags: ["creative writing","journaling","blogging","poetry","storytelling"] },
  { slug: "coding", label: "Coding & Tech", emoji: "💻", difficulty: "Intermediate", tags: ["programming","web development","python","javascript","ai","robotics"] },
  { slug: "languages", label: "Language Learning", emoji: "🗣️", difficulty: "Intermediate", tags: ["spanish","french","japanese","mandarin","conversation"] },
  { slug: "astronomy", label: "Astronomy", emoji: "🔭", difficulty: "Beginner", tags: ["stargazing","telescope","planets","space","constellations","night sky"] },
];

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    // Fetch upcoming approved events from Supabase
    const today = new Date().toISOString().split("T")[0];
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, date, time, location, emoji, group_name, price_cents")
      .eq("status", "approved")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(50);

    const eventsContext = (events || [])
      .map((e: any) => `- [${e.id}] ${e.emoji} ${e.title} | ${e.date} ${e.time} | ${e.location}${e.group_name ? ` | by ${e.group_name}` : ""} | ${e.price_cents ? `$${(e.price_cents / 100).toFixed(2)}` : "Free"} | ${e.description?.slice(0, 120) || ""}`)
      .join("\n");

    const hobbiesContext = HOBBIES
      .map((h) => `- [${h.slug}] ${h.emoji} ${h.label} (${h.difficulty}) — tags: ${h.tags.join(", ")}`)
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a search assistant for Akin, a hobby discovery app. A user searched:

"${query.trim().slice(0, 300)}"

Here are the available hobbies:
${hobbiesContext}

Here are upcoming events:
${eventsContext || "(no upcoming events)"}

Return a JSON object with:
1. "summary" — a friendly 1-2 sentence natural language response to their query
2. "hobbies" — array of matched hobby slugs (from the [slug] identifiers above), ranked by relevance. Max 8.
3. "events" — array of matched event IDs (from the [id] identifiers above), ranked by relevance. Max 6.

Match broadly based on intent, not just keywords. If someone says "something relaxing" match calming hobbies. If they say "this weekend" prioritize near-date events.

Return ONLY valid JSON, no markdown fences.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse Claude's JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try extracting JSON from possible markdown
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { summary: text, hobbies: [], events: [] };
    }

    return res.status(200).json({
      summary: parsed.summary || "",
      hobbies: parsed.hobbies || [],
      events: parsed.events || [],
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return res.status(500).json({ error: "Search failed. Please try again." });
  }
}
