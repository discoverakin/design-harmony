export interface HobbyData {
  slug: string;
  emoji: string;
  label: string;
  bgColor: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  tags: string[];
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
    slug: "cooking",
    emoji: "🍳",
    label: "Cooking & Baking",
    bgColor: "hsl(120 100% 93%)",
    difficulty: "Beginner",
    tags: ["baking", "cuisine", "recipe", "chef", "food", "meal prep", "grilling", "pastry", "fermentation"],
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
    slug: "arts-crafts",
    emoji: "🎨",
    label: "Arts & Crafts",
    bgColor: "hsl(18 100% 92%)",
    difficulty: "Beginner",
    tags: ["painting", "drawing", "pottery", "sculpture", "watercolor", "acrylic", "creative", "handmade", "diy"],
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
    slug: "pottery",
    emoji: "🏺",
    label: "Pottery",
    bgColor: "hsl(25 70% 92%)",
    difficulty: "Beginner",
    tags: ["clay", "wheel throwing", "sculpting", "glazing", "kiln", "ceramics", "hand building", "earthenware", "stoneware"],
    description:
      "Shape clay into functional and decorative pieces. Pottery is a deeply tactile, meditative craft that connects you with one of humanity's oldest art forms.",
    benefits: [
      "Incredibly calming and grounding",
      "Creates unique handmade objects",
      "Improves hand strength and dexterity",
      "Teaches patience and presence",
    ],
    nearbyClasses: [
      { name: "Kiln & Clay Co.", location: "0.6 mi away", rating: 4.9, price: "$$" },
      { name: "Wheel House Studio", location: "1.3 mi away", rating: 4.8, price: "$$" },
      { name: "Fire & Form Workshop", location: "2.1 mi away", rating: 4.7, price: "$$$" },
    ],
  },
  {
    slug: "knitting",
    emoji: "🧶",
    label: "Knitting & Sewing",
    bgColor: "hsl(290 60% 93%)",
    difficulty: "Beginner",
    tags: ["yarn", "sewing", "embroidery", "textile", "fiber arts", "needlework", "weaving", "macrame", "handcraft"],
    description:
      "Create cozy garments, accessories, and home décor with yarn and needles. Knitting and sewing are meditative crafts that produce beautiful, functional items.",
    benefits: [
      "Deeply relaxing and meditative",
      "Produces wearable, useful items",
      "Builds fine motor dexterity",
      "Thriving social crafting community",
    ],
    nearbyClasses: [
      { name: "Stitch & Sip", location: "0.7 mi away", rating: 4.9, price: "$" },
      { name: "Yarn & Loom Studio", location: "1.5 mi away", rating: 4.7, price: "$$" },
      { name: "Knit Night Collective", location: "0.9 mi away", rating: 4.8, price: "Free" },
    ],
  },
  {
    slug: "coding",
    emoji: "💻",
    label: "Coding & Making",
    bgColor: "hsl(220 70% 93%)",
    difficulty: "Intermediate",
    tags: ["programming", "web development", "app", "python", "javascript", "software", "robotics", "ai", "data science"],
    description:
      "Learn to build websites, apps, and software. Coding opens doors to tech careers and gives you the power to create digital solutions to real problems.",
    benefits: [
      "Highly in-demand career skill",
      "Develops logical thinking",
      "Enables you to build anything digital",
      "Large supportive online community",
    ],
    nearbyClasses: [
      { name: "Code Academy Hub", location: "0.4 mi away", rating: 4.9, price: "$$" },
      { name: "Hackathon Meetup", location: "1.3 mi away", rating: 4.7, price: "Free" },
      { name: "Robotics Lab", location: "2.1 mi away", rating: 4.6, price: "$$$" },
    ],
  },
  {
    slug: "dance",
    emoji: "💃",
    label: "Dance",
    bgColor: "hsl(340 80% 93%)",
    difficulty: "Beginner",
    tags: ["salsa", "hip hop", "ballet", "contemporary", "latin", "swing", "ballroom", "choreography", "movement"],
    description:
      "Move to the rhythm with dance styles from salsa to hip hop to ballet. Dance is a joyful way to stay fit, express yourself, and meet new people.",
    benefits: [
      "Full-body cardiovascular workout",
      "Boosts confidence and self-expression",
      "Improves coordination and rhythm",
      "Highly social and community-oriented",
    ],
    nearbyClasses: [
      { name: "Rhythm & Motion Studio", location: "0.5 mi away", rating: 4.9, price: "$$" },
      { name: "Salsa Nights Club", location: "1.0 mi away", rating: 4.7, price: "$" },
      { name: "Ballet Barre Academy", location: "1.8 mi away", rating: 4.8, price: "$$$" },
    ],
  },
  {
    slug: "music",
    emoji: "🎵",
    label: "Music",
    bgColor: "hsl(40 100% 93%)",
    difficulty: "Intermediate",
    tags: ["guitar", "piano", "drums", "singing", "instrument", "band", "production", "songwriting", "ukulele"],
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
];

export const getHobbyBySlug = (slug: string): HobbyData | undefined =>
  hobbies.find((h) => h.slug === slug);
