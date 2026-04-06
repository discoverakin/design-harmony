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
          { label: "Making something with my hands", emoji: "🖐️", scores: { "arts-crafts": 3, cooking: 1 } },
          { label: "Getting active outdoors", emoji: "🌲", scores: { sports: 3 } },
          { label: "Chilling with music or a good book", emoji: "🎧", scores: { music: 2, reading: 2 } },
          { label: "Playing games with friends", emoji: "🕹️", scores: { gaming: 3 } },
        ],
      },
      {
        question: "What's your ideal Saturday morning?",
        emoji: "🌅",
        options: [
          { label: "Visiting a farmers market", emoji: "🧺", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Going for a long run", emoji: "🏃", scores: { sports: 3 } },
          { label: "Reading at a café", emoji: "☕", scores: { reading: 2, music: 2 } },
          { label: "Playing video games with friends", emoji: "🎮", scores: { gaming: 3 } },
        ],
      },
      {
        question: "Pick your perfect way to unwind:",
        emoji: "😌",
        options: [
          { label: "Making something with my hands", emoji: "🖐️", scores: { "arts-crafts": 3, cooking: 1 } },
          { label: "Getting outside", emoji: "🌳", scores: { sports: 3 } },
          { label: "Curling up with a book", emoji: "📖", scores: { reading: 2, music: 2 } },
          { label: "Gaming session", emoji: "🕹️", scores: { gaming: 3 } },
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
          { label: "Drawing, painting, or sculpting", emoji: "🎨", scores: { "arts-crafts": 3 } },
          { label: "Strategy and problem-solving", emoji: "♟️", scores: { gaming: 2, reading: 1 } },
        ],
      },
      {
        question: "Which class would you sign up for first?",
        emoji: "📋",
        options: [
          { label: "Photography workshop", emoji: "📸", scores: { "arts-crafts": 3 } },
          { label: "Cooking masterclass", emoji: "👨‍🍳", scores: { cooking: 3 } },
          { label: "Painting session", emoji: "🎨", scores: { "arts-crafts": 3 } },
          { label: "Chess strategy club", emoji: "♟️", scores: { gaming: 2, reading: 1 } },
        ],
      },
      {
        question: "What skill have you always wanted?",
        emoji: "✨",
        options: [
          { label: "Play an instrument", emoji: "🎹", scores: { music: 3 } },
          { label: "Cook like a chef", emoji: "🔪", scores: { cooking: 3 } },
          { label: "Create visual art", emoji: "🖌️", scores: { "arts-crafts": 3 } },
          { label: "Master a strategy game", emoji: "🧩", scores: { gaming: 2, reading: 1 } },
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
          { label: "A team sport or fitness class", emoji: "⚽", scores: { sports: 3 } },
          { label: "A cozy book club", emoji: "📖", scores: { reading: 3 } },
          { label: "A jam session or open mic", emoji: "🎤", scores: { music: 3 } },
          { label: "A cooking class or potluck", emoji: "🍳", scores: { cooking: 3, "arts-crafts": 1 } },
        ],
      },
      {
        question: "What kind of event excites you most?",
        emoji: "🎪",
        options: [
          { label: "Team sports league", emoji: "🏀", scores: { sports: 3 } },
          { label: "Literary salon", emoji: "📚", scores: { reading: 3 } },
          { label: "Open mic night", emoji: "🎤", scores: { music: 3 } },
          { label: "Dinner party", emoji: "🍽️", scores: { cooking: 3, "arts-crafts": 1 } },
        ],
      },
      {
        question: "Your perfect Friday night is:",
        emoji: "🌙",
        options: [
          { label: "Active game night", emoji: "🏓", scores: { sports: 3 } },
          { label: "Quiet book club", emoji: "📖", scores: { reading: 3 } },
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
          { label: "Staying fit and healthy", emoji: "💪", scores: { sports: 3 } },
          { label: "Exploring new stories & ideas", emoji: "💡", scores: { reading: 3, gaming: 1 } },
          { label: "Impressing friends & family", emoji: "🎉", scores: { cooking: 3 } },
        ],
      },
      {
        question: "What would make you proudest?",
        emoji: "🏆",
        options: [
          { label: "Creating something beautiful", emoji: "✨", scores: { "arts-crafts": 3, music: 1 } },
          { label: "Getting physically stronger", emoji: "💪", scores: { sports: 3 } },
          { label: "Writing a great story", emoji: "📝", scores: { reading: 3, gaming: 1 } },
          { label: "Making people impressed", emoji: "😎", scores: { cooking: 3 } },
        ],
      },
      {
        question: "Your biggest drive is:",
        emoji: "⚡",
        options: [
          { label: "Self-expression", emoji: "🎭", scores: { "arts-crafts": 3, music: 1 } },
          { label: "Physical health", emoji: "🏋️", scores: { sports: 3 } },
          { label: "Storytelling", emoji: "📖", scores: { reading: 3, gaming: 1 } },
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
          { label: "Park run & smoothie", emoji: "🏃", scores: { sports: 3 } },
          { label: "Museum & café hopping", emoji: "🏛️", scores: { "arts-crafts": 2, reading: 2 } },
          { label: "Gaming marathon & pizza", emoji: "🍕", scores: { gaming: 3 } },
        ],
      },
      {
        question: "Your dream day off looks like:",
        emoji: "💭",
        options: [
          { label: "Exploring a local market", emoji: "🛍️", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Morning run in the park", emoji: "🌄", scores: { sports: 3 } },
          { label: "Museum or gallery visit", emoji: "🖼️", scores: { "arts-crafts": 2, reading: 2 } },
          { label: "Gaming tournament", emoji: "🎮", scores: { gaming: 3 } },
        ],
      },
      {
        question: "What recharges you most?",
        emoji: "🔋",
        options: [
          { label: "Making or creating something", emoji: "🛠️", scores: { cooking: 3, "arts-crafts": 1 } },
          { label: "Physical activity outdoors", emoji: "🚴", scores: { sports: 3 } },
          { label: "Cultural experience", emoji: "🎭", scores: { "arts-crafts": 2, reading: 2 } },
          { label: "Competitive fun", emoji: "🕹️", scores: { gaming: 3 } },
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
