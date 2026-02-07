import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import logoAkin from "@/assets/logo-akin.png";
import logoAkinDark from "@/assets/logo-akin-dark.png";

interface OnboardingSlide {
  emoji: string;
  title: string;
  description: string;
  bgToken: string;
}

const slides: OnboardingSlide[] = [
  {
    emoji: "🌟",
    title: "Welcome to Akin",
    description:
      "Discover hobbies you'll love, connect with people who share your passions, and make every free moment count.",
    bgToken: "var(--brand-cream)",
  },
  {
    emoji: "🎯",
    title: "Find Your Thing",
    description:
      "Take a quick quiz or browse categories to uncover hobbies perfectly suited to your interests and lifestyle.",
    bgToken: "var(--brand-light)",
  },
  {
    emoji: "📍",
    title: "Explore Nearby",
    description:
      "Find classes, clubs, and meetups happening right around you. Your next favourite activity is closer than you think.",
    bgToken: "var(--brand-cream)",
  },
  {
    emoji: "🤝",
    title: "Join the Community",
    description:
      "Share your journey, swap tips, and cheer each other on. Hobbies are better together.",
    bgToken: "var(--brand-light)",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -120 : 120,
    opacity: 0,
    scale: 0.95,
  }),
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next >= slides.length) {
      completeOnboarding();
      return;
    }
    if (next < 0) return;
    setPage([next, newDirection]);
  };

  const completeOnboarding = () => {
    localStorage.setItem("akin-onboarding-complete", "true");
    navigate("/", { replace: true });
  };

  const slide = slides[page];
  const isLast = page === slides.length - 1;

  return (
    <motion.div
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: `hsl(${slide.bgToken})` }}
    >
      {/* Header area with logo */}
      <div className="flex items-center justify-between px-5 pt-6">
        <img src={theme === "dark" ? logoAkinDark : logoAkin} alt="Akin" className="h-7" />
        {page > 0 && (
          <button
            onClick={completeOnboarding}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
            }}
            className="flex flex-col items-center text-center"
          >
            {/* Emoji with creamsicle-tinted background circle */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-28 h-28 rounded-full bg-brand-creamsicle/30 flex items-center justify-center mb-8 shadow-sm"
            >
              <span className="text-6xl">{slide.emoji}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground font-heading mb-3"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-muted-foreground leading-relaxed max-w-xs"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-10">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setPage([i, i > page ? 1 : -1])}
              className="rounded-full transition-colors"
              animate={{
                width: i === page ? 28 : 8,
                backgroundColor:
                  i === page
                    ? "hsl(var(--brand-orange))"
                    : "hsl(var(--brand-dark-brown) / 0.2)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ height: 8 }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {page > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => paginate(-1)}
              className="flex-1 h-14 rounded-2xl border-2 border-foreground/15 text-foreground font-semibold text-base hover:bg-foreground/5 transition-colors"
            >
              Back
            </motion.button>
          )}
          <motion.button
            layout
            onClick={() => paginate(1)}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
            whileTap={{ scale: 0.97 }}
          >
            {isLast ? "Get Started" : "Next"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Onboarding;
