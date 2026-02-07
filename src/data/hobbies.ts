export type HobbyCategory = "Creative" | "Active" | "Social" | "Intellectual";

export interface HobbyData {
  slug: string;
  emoji: string;
  label: string;
  category: HobbyCategory;
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

export const hobbyCategories: { key: HobbyCategory; emoji: string; description: string }[] = [
  { key: "Creative", emoji: "🎨", description: "Express yourself through art, music, and craft" },
  { key: "Active", emoji: "⚡", description: "Move your body and embrace the outdoors" },
  { key: "Social", emoji: "🤝", description: "Connect, share, and grow with others" },
  { key: "Intellectual", emoji: "🧠", description: "Learn, explore, and expand your mind" },
];

export const hobbies: HobbyData[] = [
  // ─── Creative ─────────────────────────────────────────
  {
    slug: "arts-crafts",
    emoji: "🎨",
    label: "Arts & Crafts",
    category: "Creative",
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
    slug: "music",
    emoji: "🎵",
    label: "Music",
    category: "Creative",
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
  {
    slug: "photography",
    emoji: "📸",
    label: "Photography",
    category: "Creative",
    bgColor: "hsl(200 80% 93%)",
    difficulty: "Beginner",
    tags: ["camera", "photo", "portrait", "landscape", "editing", "lightroom", "street photography", "film", "digital"],
    description:
      "Capture the world through your lens. Photography teaches you to see beauty in everyday moments and express your unique perspective visually.",
    benefits: [
      "Sharpens observation and attention to detail",
      "Provides a creative outlet anywhere",
      "Documents memories beautifully",
      "Can become a freelance income source",
    ],
    nearbyClasses: [
      { name: "Shutter School", location: "0.9 mi away", rating: 4.8, price: "$$" },
      { name: "Golden Hour Walks", location: "1.4 mi away", rating: 4.7, price: "$" },
      { name: "Darkroom Lab", location: "2.5 mi away", rating: 4.6, price: "$$" },
    ],
  },
  {
    slug: "knitting",
    emoji: "🧶",
    label: "Knitting & Crochet",
    category: "Creative",
    bgColor: "hsl(290 60% 93%)",
    difficulty: "Beginner",
    tags: ["yarn", "sewing", "embroidery", "textile", "fiber arts", "needlework", "weaving", "macrame", "handcraft"],
    description:
      "Create cozy garments, accessories, and home décor with yarn and needles. Knitting and crochet are meditative crafts that produce beautiful, functional items.",
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
    slug: "pottery",
    emoji: "🏺",
    label: "Pottery & Ceramics",
    category: "Creative",
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
    slug: "woodworking",
    emoji: "🪵",
    label: "Woodworking",
    category: "Creative",
    bgColor: "hsl(30 60% 90%)",
    difficulty: "Intermediate",
    tags: ["carpentry", "furniture", "carving", "diy", "tools", "workshop", "cabinet making", "turning", "restoration"],
    description:
      "Shape raw wood into furniture, décor, and functional objects. Woodworking combines craftsmanship with problem-solving for deeply satisfying results.",
    benefits: [
      "Creates functional, lasting pieces",
      "Develops spatial reasoning skills",
      "Provides hands-on stress relief",
      "Can save money on home projects",
    ],
    nearbyClasses: [
      { name: "Sawdust & Stain", location: "1.1 mi away", rating: 4.8, price: "$$" },
      { name: "Community Woodshop", location: "1.6 mi away", rating: 4.7, price: "$" },
      { name: "Maker's Workshop", location: "2.4 mi away", rating: 4.6, price: "$$" },
    ],
  },
  {
    slug: "film-making",
    emoji: "🎬",
    label: "Film & Video",
    category: "Creative",
    bgColor: "hsl(260 60% 93%)",
    difficulty: "Intermediate",
    tags: ["video editing", "directing", "cinema", "documentary", "short film", "youtube", "content creation", "animation", "vlogging"],
    description:
      "Tell stories through the lens of a camera. Film-making combines visual art, storytelling, and technology into a powerful creative medium.",
    benefits: [
      "Combines multiple creative skills",
      "Highly shareable and rewarding",
      "Opens doors to media careers",
      "Develops technical and artistic thinking",
    ],
    nearbyClasses: [
      { name: "Indie Film Collective", location: "1.2 mi away", rating: 4.8, price: "$$" },
      { name: "Edit Suite Workshop", location: "0.8 mi away", rating: 4.6, price: "$" },
      { name: "Short Film Saturdays", location: "1.9 mi away", rating: 4.7, price: "Free" },
    ],
  },

  // ─── Active ───────────────────────────────────────────
  {
    slug: "sports",
    emoji: "⚽",
    label: "Sports",
    category: "Active",
    bgColor: "hsl(209 100% 95%)",
    difficulty: "Beginner",
    tags: ["soccer", "football", "basketball", "tennis", "volleyball", "rugby", "team", "fitness", "athletic"],
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
    slug: "yoga",
    emoji: "🧘",
    label: "Yoga & Meditation",
    category: "Active",
    bgColor: "hsl(160 60% 92%)",
    difficulty: "Beginner",
    tags: ["mindfulness", "stretching", "flexibility", "wellness", "breathwork", "pilates", "zen", "relaxation", "mental health"],
    description:
      "Build flexibility, strength, and inner calm through yoga and meditation. These practices transform both body and mind for lasting well-being.",
    benefits: [
      "Increases flexibility and balance",
      "Reduces anxiety and promotes calm",
      "Improves posture and core strength",
      "Enhances focus and mindfulness",
    ],
    nearbyClasses: [
      { name: "Flow Studio", location: "0.3 mi away", rating: 4.9, price: "$$" },
      { name: "Zen Garden Yoga", location: "1.1 mi away", rating: 4.8, price: "$" },
      { name: "Mindful Movement Co.", location: "1.7 mi away", rating: 4.7, price: "$$" },
    ],
  },
  {
    slug: "dance",
    emoji: "💃",
    label: "Dance",
    category: "Active",
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
    slug: "hiking",
    emoji: "🥾",
    label: "Hiking & Outdoors",
    category: "Active",
    bgColor: "hsl(140 50% 92%)",
    difficulty: "Beginner",
    tags: ["trails", "nature", "camping", "trekking", "backpacking", "mountains", "walking", "adventure", "wilderness"],
    description:
      "Hit the trails and explore the natural world around you. Hiking combines exercise with breathtaking scenery and is perfect for solo or group adventures.",
    benefits: [
      "Excellent cardio and leg workout",
      "Connects you deeply with nature",
      "Reduces stress and boosts mood",
      "Free and accessible anywhere",
    ],
    nearbyClasses: [
      { name: "Trail Blazers Club", location: "1.5 mi away", rating: 4.8, price: "Free" },
      { name: "Weekend Wanderers", location: "0.8 mi away", rating: 4.7, price: "$" },
      { name: "Summit Seekers Group", location: "2.0 mi away", rating: 4.9, price: "$" },
    ],
  },
  {
    slug: "fitness",
    emoji: "💪",
    label: "Fitness & Gym",
    category: "Active",
    bgColor: "hsl(0 70% 93%)",
    difficulty: "Beginner",
    tags: ["weightlifting", "crossfit", "running", "cycling", "cardio", "strength training", "calisthenics", "hiit", "marathon"],
    description:
      "Build strength, endurance, and confidence through gym workouts and fitness training. Find the routine that works for your body and goals.",
    benefits: [
      "Builds muscle and bone density",
      "Boosts metabolism and energy",
      "Improves mental health significantly",
      "Creates lasting healthy habits",
    ],
    nearbyClasses: [
      { name: "Iron Works Gym", location: "0.3 mi away", rating: 4.7, price: "$$" },
      { name: "CrossFit Box", location: "1.0 mi away", rating: 4.8, price: "$$$" },
      { name: "Run Club City", location: "0.5 mi away", rating: 4.9, price: "Free" },
    ],
  },
  {
    slug: "swimming",
    emoji: "🏊",
    label: "Swimming",
    category: "Active",
    bgColor: "hsl(195 80% 93%)",
    difficulty: "Beginner",
    tags: ["pool", "laps", "water sports", "aquatic", "diving", "snorkeling", "water polo", "triathlon", "open water"],
    description:
      "Dive into the water for a full-body workout that's easy on the joints. Swimming builds endurance and is a life skill everyone should master.",
    benefits: [
      "Low-impact full-body workout",
      "Improves lung capacity",
      "Excellent for joint health",
      "Builds water confidence and safety",
    ],
    nearbyClasses: [
      { name: "AquaFit Center", location: "0.8 mi away", rating: 4.7, price: "$$" },
      { name: "City Pool Lanes", location: "0.4 mi away", rating: 4.5, price: "$" },
      { name: "Open Water Swim Club", location: "3.0 mi away", rating: 4.9, price: "$" },
    ],
  },
  {
    slug: "martial-arts",
    emoji: "🥋",
    label: "Martial Arts",
    category: "Active",
    bgColor: "hsl(15 70% 93%)",
    difficulty: "Intermediate",
    tags: ["karate", "judo", "taekwondo", "boxing", "mma", "self-defense", "kickboxing", "jiu-jitsu", "kung fu"],
    description:
      "Build discipline, strength, and confidence through martial arts. Whether it's karate, boxing, or jiu-jitsu, these practices shape both body and character.",
    benefits: [
      "Builds self-defense skills",
      "Develops discipline and respect",
      "Full-body strength and flexibility",
      "Boosts confidence significantly",
    ],
    nearbyClasses: [
      { name: "Dragon Dojo", location: "0.9 mi away", rating: 4.8, price: "$$" },
      { name: "Iron Fist Boxing Gym", location: "1.4 mi away", rating: 4.7, price: "$$" },
      { name: "Grappling Academy", location: "2.0 mi away", rating: 4.9, price: "$$$" },
    ],
  },
  {
    slug: "rock-climbing",
    emoji: "🧗",
    label: "Rock Climbing",
    category: "Active",
    bgColor: "hsl(35 60% 92%)",
    difficulty: "Intermediate",
    tags: ["bouldering", "climbing gym", "outdoor climbing", "rappelling", "belaying", "sport climbing", "wall climbing"],
    description:
      "Scale walls and boulders for an exhilarating full-body challenge. Rock climbing builds problem-solving skills alongside serious grip strength.",
    benefits: [
      "Full-body functional strength",
      "Develops mental problem-solving",
      "Builds trust and community",
      "Conquers fear and builds confidence",
    ],
    nearbyClasses: [
      { name: "Summit Climbing Gym", location: "1.0 mi away", rating: 4.9, price: "$$" },
      { name: "Boulder Barn", location: "1.7 mi away", rating: 4.7, price: "$$" },
      { name: "Vertical Venture", location: "2.8 mi away", rating: 4.6, price: "$$$" },
    ],
  },
  {
    slug: "board-sports",
    emoji: "🛹",
    label: "Skateboarding & Surfing",
    category: "Active",
    bgColor: "hsl(45 80% 92%)",
    difficulty: "Intermediate",
    tags: ["skateboard", "surfing", "snowboarding", "longboard", "skating", "waves", "skatepark", "extreme sports"],
    description:
      "Ride waves, streets, or slopes with board sports. These thrilling activities build balance, coordination, and a deep connection to your environment.",
    benefits: [
      "Excellent balance and coordination",
      "Strong sense of community and culture",
      "Full-body workout with fun",
      "Builds resilience and perseverance",
    ],
    nearbyClasses: [
      { name: "Wave Riders School", location: "2.5 mi away", rating: 4.8, price: "$$" },
      { name: "City Skate Park", location: "0.7 mi away", rating: 4.5, price: "Free" },
      { name: "Board & Balance", location: "1.4 mi away", rating: 4.7, price: "$" },
    ],
  },

  // ─── Social ───────────────────────────────────────────
  {
    slug: "cooking",
    emoji: "👨‍🍳",
    label: "Cooking",
    category: "Social",
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
    slug: "gaming",
    emoji: "🎮",
    label: "Gaming",
    category: "Social",
    bgColor: "hsl(330 100% 95%)",
    difficulty: "Beginner",
    tags: ["video games", "board games", "tabletop", "rpg", "esports", "strategy", "multiplayer", "card games", "puzzle"],
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
  {
    slug: "gardening",
    emoji: "🌱",
    label: "Gardening",
    category: "Social",
    bgColor: "hsl(100 60% 92%)",
    difficulty: "Beginner",
    tags: ["plants", "flowers", "vegetables", "herbs", "landscaping", "indoor plants", "succulents", "organic", "composting"],
    description:
      "Grow your own plants, flowers, vegetables, and herbs. Gardening connects you with nature and provides the deeply satisfying reward of nurturing life.",
    benefits: [
      "Provides fresh, home-grown produce",
      "Reduces stress through nature connection",
      "Improves physical activity levels",
      "Creates a beautiful living space",
    ],
    nearbyClasses: [
      { name: "Green Thumb Collective", location: "0.7 mi away", rating: 4.8, price: "$" },
      { name: "Community Garden Hub", location: "1.2 mi away", rating: 4.9, price: "Free" },
      { name: "Urban Farmer Workshop", location: "2.3 mi away", rating: 4.6, price: "$$" },
    ],
  },
  {
    slug: "volunteering",
    emoji: "🤝",
    label: "Volunteering",
    category: "Social",
    bgColor: "hsl(170 50% 92%)",
    difficulty: "Beginner",
    tags: ["community service", "charity", "nonprofit", "helping", "social impact", "mentoring", "fundraising", "environment"],
    description:
      "Give back to your community while discovering new passions. Volunteering is a fulfilling way to make a difference and meet like-minded people.",
    benefits: [
      "Creates meaningful social impact",
      "Builds empathy and perspective",
      "Expands your professional network",
      "Boosts happiness and life satisfaction",
    ],
    nearbyClasses: [
      { name: "Volunteer Connect", location: "0.5 mi away", rating: 4.9, price: "Free" },
      { name: "Green Earth Initiative", location: "1.0 mi away", rating: 4.8, price: "Free" },
      { name: "Youth Mentoring Program", location: "1.6 mi away", rating: 4.7, price: "Free" },
    ],
  },

  // ─── Intellectual ─────────────────────────────────────
  {
    slug: "reading",
    emoji: "📚",
    label: "Reading",
    category: "Intellectual",
    bgColor: "hsl(270 100% 95%)",
    difficulty: "Beginner",
    tags: ["books", "fiction", "non-fiction", "literature", "book club", "audiobooks", "library", "novel", "poetry"],
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
    slug: "writing",
    emoji: "✍️",
    label: "Writing",
    category: "Intellectual",
    bgColor: "hsl(50 80% 92%)",
    difficulty: "Beginner",
    tags: ["creative writing", "journaling", "blogging", "poetry", "fiction", "storytelling", "screenwriting", "essay", "memoir"],
    description:
      "Put your thoughts into words through creative writing, journaling, or blogging. Writing is a powerful way to process emotions and share your stories.",
    benefits: [
      "Improves communication skills",
      "Provides emotional processing outlet",
      "Boosts creativity and imagination",
      "Can lead to publishing opportunities",
    ],
    nearbyClasses: [
      { name: "Writers' Workshop", location: "0.6 mi away", rating: 4.8, price: "$" },
      { name: "Poetry Slam Night", location: "1.1 mi away", rating: 4.6, price: "Free" },
      { name: "Storytellers Circle", location: "1.9 mi away", rating: 4.7, price: "$" },
    ],
  },
  {
    slug: "coding",
    emoji: "💻",
    label: "Coding & Tech",
    category: "Intellectual",
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
    slug: "languages",
    emoji: "🗣️",
    label: "Language Learning",
    category: "Intellectual",
    bgColor: "hsl(180 60% 92%)",
    difficulty: "Intermediate",
    tags: ["spanish", "french", "japanese", "mandarin", "german", "italian", "korean", "multilingual", "conversation"],
    description:
      "Open doors to new cultures and connections by learning a new language. It's one of the most rewarding intellectual pursuits you can take on.",
    benefits: [
      "Enhances travel experiences immensely",
      "Boosts cognitive flexibility",
      "Opens career opportunities globally",
      "Connects you with diverse cultures",
    ],
    nearbyClasses: [
      { name: "Lingua Café", location: "0.6 mi away", rating: 4.8, price: "$" },
      { name: "Polyglot Meetup", location: "1.2 mi away", rating: 4.7, price: "Free" },
      { name: "Conversational Spanish Club", location: "1.8 mi away", rating: 4.9, price: "$" },
    ],
  },
  {
    slug: "astronomy",
    emoji: "🔭",
    label: "Astronomy",
    category: "Intellectual",
    bgColor: "hsl(240 50% 93%)",
    difficulty: "Beginner",
    tags: ["stargazing", "telescope", "planets", "space", "constellations", "astrophotography", "cosmos", "night sky", "science"],
    description:
      "Explore the cosmos from your own backyard. Astronomy combines science with wonder, offering a humbling perspective on our place in the universe.",
    benefits: [
      "Inspires curiosity and wonder",
      "Teaches patience and observation",
      "Combines science with relaxation",
      "Can be enjoyed solo or in groups",
    ],
    nearbyClasses: [
      { name: "Stargazers Society", location: "1.3 mi away", rating: 4.9, price: "Free" },
      { name: "Observatory Night Tours", location: "4.5 mi away", rating: 4.8, price: "$" },
      { name: "Astro Photo Club", location: "2.0 mi away", rating: 4.7, price: "$$" },
    ],
  },
];

export const getHobbyBySlug = (slug: string): HobbyData | undefined =>
  hobbies.find((h) => h.slug === slug);
