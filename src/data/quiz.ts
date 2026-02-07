export interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  options: {
    label: string;
    emoji: string;
    scores: Record<string, number>; // slug → weight
  }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you like to spend a free afternoon?",
    emoji: "☀️",
    options: [
      {
        label: "Making something with my hands",
        emoji: "🖐️",
        scores: { "arts-crafts": 3, cooking: 1 },
      },
      {
        label: "Getting active outdoors",
        emoji: "🌲",
        scores: { sports: 3 },
      },
      {
        label: "Chilling with music or a good book",
        emoji: "🎧",
        scores: { music: 2, reading: 2 },
      },
      {
        label: "Playing games with friends",
        emoji: "🕹️",
        scores: { gaming: 3 },
      },
    ],
  },
  {
    id: 2,
    question: "What sounds most exciting to learn?",
    emoji: "🧠",
    options: [
      {
        label: "A new instrument or singing",
        emoji: "🎸",
        scores: { music: 3 },
      },
      {
        label: "Recipes from around the world",
        emoji: "🌍",
        scores: { cooking: 3 },
      },
      {
        label: "Drawing, painting, or sculpting",
        emoji: "🎨",
        scores: { "arts-crafts": 3 },
      },
      {
        label: "Strategy and problem-solving",
        emoji: "♟️",
        scores: { gaming: 2, reading: 1 },
      },
    ],
  },
  {
    id: 3,
    question: "Pick your ideal group setting:",
    emoji: "👥",
    options: [
      {
        label: "A team sport or fitness class",
        emoji: "⚽",
        scores: { sports: 3 },
      },
      {
        label: "A cozy book club",
        emoji: "📖",
        scores: { reading: 3 },
      },
      {
        label: "A jam session or open mic",
        emoji: "🎤",
        scores: { music: 3 },
      },
      {
        label: "A cooking class or potluck",
        emoji: "🍳",
        scores: { cooking: 3, "arts-crafts": 1 },
      },
    ],
  },
  {
    id: 4,
    question: "What motivates you most?",
    emoji: "🔥",
    options: [
      {
        label: "Creating something beautiful",
        emoji: "✨",
        scores: { "arts-crafts": 3, music: 1 },
      },
      {
        label: "Staying fit and healthy",
        emoji: "💪",
        scores: { sports: 3 },
      },
      {
        label: "Exploring new stories & ideas",
        emoji: "💡",
        scores: { reading: 3, gaming: 1 },
      },
      {
        label: "Impressing friends & family",
        emoji: "🎉",
        scores: { cooking: 3 },
      },
    ],
  },
  {
    id: 5,
    question: "Pick a weekend vibe:",
    emoji: "🌈",
    options: [
      {
        label: "Farmers market & brunch",
        emoji: "🥐",
        scores: { cooking: 3, "arts-crafts": 1 },
      },
      {
        label: "Park run & smoothie",
        emoji: "🏃",
        scores: { sports: 3 },
      },
      {
        label: "Museum & café hopping",
        emoji: "🏛️",
        scores: { "arts-crafts": 2, reading: 2 },
      },
      {
        label: "Gaming marathon & pizza",
        emoji: "🍕",
        scores: { gaming: 3 },
      },
    ],
  },
];

export function calculateResults(
  answers: Record<number, number>
): { slug: string; score: number }[] {
  const totals: Record<string, number> = {};

  Object.entries(answers).forEach(([qIdStr, optionIdx]) => {
    const qId = Number(qIdStr);
    const question = quizQuestions.find((q) => q.id === qId);
    if (!question) return;
    const option = question.options[optionIdx];
    if (!option) return;
    Object.entries(option.scores).forEach(([slug, weight]) => {
      totals[slug] = (totals[slug] || 0) + weight;
    });
  });

  return Object.entries(totals)
    .map(([slug, score]) => ({ slug, score }))
    .sort((a, b) => b.score - a.score);
}
