export interface HobbyData {
  slug: string;
  emoji: string;
  label: string;
  bgColor: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  benefits: string[];
  nearbyClasses: {
    name: string;
    location: string;
    rating: number;
    price: string;
  }[];
}

export const hobbies: HobbyData[] = [
  {
    slug: "arts-crafts",
    emoji: "🎨",
    label: "Arts & Crafts",
    bgColor: "hsl(18 100% 92%)",
    difficulty: "Beginner",
    description:
      "Express yourself through painting, drawing, pottery, and more. Arts & crafts is a wonderful way to unwind, build fine motor skills, and create something beautiful with your hands.",
    benefits: [
      "Reduces stress and anxiety",
      "Improves fine motor skills",
      "Boosts creativity and self-expression",
      "Creates meaningful handmade gifts",
    ],
    nearbyClasses: [
      { name: "The Clay Studio", location: "0.8 mi away", rating: 4.9, price: "$$" },
      { name: "Palette & Pour", location: "1.2 mi away", rating: 4.7, price: "$" },
      { name: "Craft Corner Workshop", location: "2.1 mi away", rating: 4.8, price: "$$" },
    ],
  },
  {
    slug: "sports",
    emoji: "⚽",
    label: "Sports",
    bgColor: "hsl(209 100% 95%)",
    difficulty: "Beginner",
    description:
      "Stay active and meet new people through team and individual sports. From soccer to tennis, there's a sport for every fitness level and interest.",
    benefits: [
      "Improves cardiovascular health",
      "Builds teamwork and social skills",
      "Boosts mood and energy levels",
      "Develops discipline and focus",
    ],
    nearbyClasses: [
      { name: "City Rec League", location: "0.5 mi away", rating: 4.6, price: "$" },
      { name: "Ace Tennis Club", location: "1.8 mi away", rating: 4.8, price: "$$$" },
      { name: "FitPlay Sports Center", location: "2.4 mi away", rating: 4.5, price: "$$" },
    ],
  },
  {
    slug: "music",
    emoji: "🎵",
    label: "Music",
    bgColor: "hsl(40 100% 93%)",
    difficulty: "Intermediate",
    description:
      "Learn an instrument, join a band, or explore music production. Music enriches your life with rhythm, melody, and a deep sense of accomplishment.",
    benefits: [
      "Enhances memory and cognitive function",
      "Provides emotional outlet",
      "Builds patience and perseverance",
      "Connects you with other musicians",
    ],
    nearbyClasses: [
      { name: "Harmony Music School", location: "1.0 mi away", rating: 4.9, price: "$$" },
      { name: "Beat Lab Studios", location: "1.5 mi away", rating: 4.6, price: "$$$" },
      { name: "Open Mic Café", location: "0.3 mi away", rating: 4.7, price: "$" },
    ],
  },
  {
    slug: "cooking",
    emoji: "👨‍🍳",
    label: "Cooking",
    bgColor: "hsl(120 100% 93%)",
    difficulty: "Beginner",
    description:
      "Master new cuisines, baking techniques, and flavor combinations. Cooking is a practical hobby that delights your taste buds and impresses friends and family.",
    benefits: [
      "Saves money on eating out",
      "Encourages healthier eating habits",
      "Great way to explore cultures",
      "Perfect for socialising and hosting",
    ],
    nearbyClasses: [
      { name: "Chef's Table Academy", location: "1.1 mi away", rating: 4.8, price: "$$" },
      { name: "Bake It Up!", location: "0.7 mi away", rating: 4.9, price: "$" },
      { name: "Global Kitchen Co.", location: "2.0 mi away", rating: 4.6, price: "$$" },
    ],
  },
  {
    slug: "reading",
    emoji: "📚",
    label: "Reading",
    bgColor: "hsl(270 100% 95%)",
    difficulty: "Beginner",
    description:
      "Dive into fiction, non-fiction, and everything in between. Reading expands your mind, vocabulary, and empathy while providing a calming escape from daily life.",
    benefits: [
      "Expands vocabulary and knowledge",
      "Reduces stress and improves sleep",
      "Strengthens analytical thinking",
      "Fosters empathy and perspective",
    ],
    nearbyClasses: [
      { name: "Chapter One Book Club", location: "0.4 mi away", rating: 4.9, price: "Free" },
      { name: "City Library Events", location: "0.9 mi away", rating: 4.7, price: "Free" },
      { name: "Lit Lounge Reading Group", location: "1.6 mi away", rating: 4.5, price: "$" },
    ],
  },
  {
    slug: "gaming",
    emoji: "🎮",
    label: "Gaming",
    bgColor: "hsl(330 100% 95%)",
    difficulty: "Beginner",
    description:
      "Explore board games, video games, and tabletop RPGs. Gaming sharpens strategic thinking and is a fantastic way to bond with friends old and new.",
    benefits: [
      "Improves problem-solving skills",
      "Builds online and local communities",
      "Enhances hand-eye coordination",
      "Provides stress relief and fun",
    ],
    nearbyClasses: [
      { name: "Dice & Board Café", location: "0.6 mi away", rating: 4.8, price: "$" },
      { name: "LAN Party Lounge", location: "1.3 mi away", rating: 4.5, price: "$$" },
      { name: "Quest Tabletop Club", location: "2.2 mi away", rating: 4.7, price: "$" },
    ],
  },
];

export const getHobbyBySlug = (slug: string): HobbyData | undefined =>
  hobbies.find((h) => h.slug === slug);
