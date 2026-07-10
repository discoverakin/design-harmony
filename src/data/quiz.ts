export interface QuestionVariant {
  question: string;
  emoji: string;
  options: {
    label: string;
    emoji: string;
    scores: Record<string, number>;
  }[];
}

export interface QuizQuestion {
  id: number;
  variants: QuestionVariant[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    variants: [
      {
        question: "How do you like to spend a free afternoon?",
        emoji: "☀️",
        options: [
          { label: "Making something with my hands", emoji: "🖐️", scores: { "arts-crafts": 3, pottery: 1 } },
          { label: "Moving to music", emoji: "🎶", scores: { dance: 3 } },
          { label: "Chilling with music or a cozy craft", emoji: "🎧", scores: { music: 2, knitting: 2 } },
          { label: "Tinkering on the computer", emoji: "💻", scores: { coding: 3 } },
        ],
      },
      {
        question: "What's your ideal Saturday morning?",
        emoji: "🌅",
        options: [
          { label: "Visiting a farmers market", emoji: "🧺", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "A morning dance class", emoji: "💃", scores: { dance: 3 } },
          { label: "Knitting at a café", emoji: "☕", scores: { knitting: 2, music: 2 } },
          { label: "Building a side project", emoji: "🛠️", scores: { coding: 3 } },
        ],
      },
      {
        question: "Pick your perfect way to unwind:",
        emoji: "😌",
        options: [
          { label: "Making something with my hands", emoji: "🖐️", scores: { "arts-crafts": 3, pottery: 1 } },
          { label: "Dancing it out", emoji: "🕺", scores: { dance: 3 } },
          { label: "Curling up with knitting", emoji: "🧶", scores: { knitting: 2, music: 2 } },
          { label: "Coding session", emoji: "💻", scores: { coding: 3 } },
        ],
      },
    ],
  },
  {
    id: 2,
    variants: [
      {
        question: "What sounds most exciting to learn?",
        emoji: "🧠",
        options: [
          { label: "A new instrument or singing", emoji: "🎸", scores: { music: 3 } },
          { label: "Recipes from around the world", emoji: "🌍", scores: { cooking: 3 } },
          { label: "Drawing, painting, or pottery", emoji: "🎨", scores: { "arts-crafts": 3, pottery: 1 } },
          { label: "Programming and building apps", emoji: "💻", scores: { coding: 3 } },
        ],
      },
      {
        question: "Which class would you sign up for first?",
        emoji: "📋",
        options: [
          { label: "Pottery workshop", emoji: "🏺", scores: { pottery: 3, "arts-crafts": 1 } },
          { label: "Cooking masterclass", emoji: "👨‍🍳", scores: { cooking: 3 } },
          { label: "Painting session", emoji: "🎨", scores: { "arts-crafts": 3 } },
          { label: "Coding bootcamp", emoji: "💻", scores: { coding: 3 } },
        ],
      },
      {
        question: "What skill have you always wanted?",
        emoji: "✨",
        options: [
          { label: "Play an instrument", emoji: "🎹", scores: { music: 3 } },
          { label: "Cook like a chef", emoji: "🔪", scores: { cooking: 3 } },
          { label: "Create visual art", emoji: "🖌️", scores: { "arts-crafts": 3 } },
          { label: "Build software", emoji: "🧩", scores: { coding: 3 } },
        ],
      },
    ],
  },
  {
    id: 3,
    variants: [
      {
        question: "Pick your ideal group setting:",
        emoji: "👥",
        options: [
          { label: "A group dance class", emoji: "💃", scores: { dance: 3 } },
          { label: "A cozy knitting circle", emoji: "🧶", scores: { knitting: 3 } },
          { label: "A jam session or open mic", emoji: "🎤", scores: { music: 3 } },
          { label: "A cooking class or potluck", emoji: "🍳", scores: { cooking: 3, "arts-crafts": 1 } },
        ],
      },
      {
        question: "What kind of event excites you most?",
        emoji: "🎪",
        options: [
          { label: "Salsa night", emoji: "💃", scores: { dance: 3 } },
          { label: "Craft fair", emoji: "🧶", scores: { knitting: 3, "arts-crafts": 1 } },
          { label: "Open mic night", emoji: "🎤", scores: { music: 3 } },
          { label: "Dinner party", emoji: "🍽️", scores: { cooking: 3, "arts-crafts": 1 } },
        ],
      },
      {
        question: "Your perfect Friday night is:",
        emoji: "🌙",
        options: [
          { label: "Dance class", emoji: "💃", scores: { dance: 3 } },
          { label: "Quiet knitting session", emoji: "🧶", scores: { knitting: 3 } },
          { label: "Jam session", emoji: "🎵", scores: { music: 3 } },
          { label: "Cooking with friends", emoji: "👨‍🍳", scores: { cooking: 3, "arts-crafts": 1 } },
        ],
      },
    ],
  },
  {
    id: 4,
    variants: [
      {
        question: "What motivates you most?",
        emoji: "🔥",
        options: [
          { label: "Creating something beautiful", emoji: "✨", scores: { "arts-crafts": 3, music: 1 } },
          { label: "Moving and staying energized", emoji: "💃", scores: { dance: 3 } },
          { label: "Making cozy handmade things", emoji: "🧶", scores: { knitting: 3, pottery: 1 } },
          { label: "Impressing friends & family", emoji: "🎉", scores: { cooking: 3 } },
        ],
      },
      {
        question: "What would make you proudest?",
        emoji: "🏆",
        options: [
          { label: "Creating something beautiful", emoji: "✨", scores: { "arts-crafts": 3, music: 1 } },
          { label: "Nailing a dance routine", emoji: "💃", scores: { dance: 3 } },
          { label: "Finishing a handmade project", emoji: "🧶", scores: { knitting: 3, pottery: 1 } },
          { label: "Making people impressed", emoji: "😎", scores: { cooking: 3 } },
        ],
      },
      {
        question: "Your biggest drive is:",
        emoji: "⚡",
        options: [
          { label: "Self-expression", emoji: "🎭", scores: { "arts-crafts": 3, music: 1 } },
          { label: "Movement and rhythm", emoji: "🎶", scores: { dance: 3 } },
          { label: "Slow, mindful making", emoji: "🧶", scores: { knitting: 3, pottery: 1 } },
          { label: "Achievement", emoji: "🥇", scores: { cooking: 3 } },
        ],
      },
    ],
  },
  {
    id: 5,
    variants: [
      {
        question: "Pick a weekend vibe:",
        emoji: "🌈",
        options: [
          { label: "Farmers market & brunch", emoji: "🥐", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Dance class & smoothie", emoji: "💃", scores: { dance: 3 } },
          { label: "Museum & café hopping", emoji: "🏛️", scores: { "arts-crafts": 2, knitting: 2 } },
          { label: "Coding sprint & pizza", emoji: "🍕", scores: { coding: 3 } },
        ],
      },
      {
        question: "Your dream day off looks like:",
        emoji: "💭",
        options: [
          { label: "Exploring a local market", emoji: "🛍️", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Morning dance session", emoji: "🌄", scores: { dance: 3 } },
          { label: "Museum or gallery visit", emoji: "🖼️", scores: { "arts-crafts": 2, knitting: 2 } },
          { label: "Hackathon-style tinkering", emoji: "💻", scores: { coding: 3 } },
        ],
      },
      {
        question: "What recharges you most?",
        emoji: "🔋",
        options: [
          { label: "Making or creating something", emoji: "🛠️", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Dancing", emoji: "🕺", scores: { dance: 3 } },
          { label: "Cultural experience", emoji: "🎭", scores: { "arts-crafts": 2, knitting: 2 } },
          { label: "Building something digital", emoji: "💻", scores: { coding: 3 } },
        ],
      },
    ],
  },
];

/** Pick one random variant per question */
export function getRandomizedQuestions(): (QuestionVariant & { id: number })[] {
  return quizQuestions.map((q) => {
    const variant = q.variants[Math.floor(Math.random() * q.variants.length)];
    return { ...variant, id: q.id };
  });
}

export function calculateResults(
  questions: { id: number; options: { scores: Record<string, number> }[] }[],
  answers: Record<number, number>
): { slug: string; score: number }[] {
  const totals: Record<string, number> = {};

  Object.entries(answers).forEach(([qIdStr, optionIdx]) => {
    const qId = Number(qIdStr);
    const question = questions.find((q) => q.id === qId);
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
