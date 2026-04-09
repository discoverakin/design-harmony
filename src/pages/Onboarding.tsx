import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { useProfile } from "@/hooks/use-profile";
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

// Total steps: welcome (0) + slides (1..3)
const TOTAL_DOTS = 1 + 3;

const Onboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { updateProfile } = useProfile();
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next < 0) return;

    const totalPages = 1 + slides.length; // welcome + slides
    if (next >= totalPages) {
      completeOnboarding();
      return;
    }

    setPage([next, newDirection]);
  };

  const completeOnboarding = async () => {
    localStorage.setItem("akin-onboarding-complete", "true");
    const userType = (localStorage.getItem("akin-user-type") || "seeker") as "seeker" | "owner";
    await updateProfile({ hasCompletedOnboarding: true, userType });
    navigate("/home", { replace: true });
  };

  const slideIndex = page - 1; // slides start at page 1
  const slide = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;

  // --- Welcome splash screen (page 0) ---
  if (page === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden relative"
        style={{ background: "linear-gradient(160deg, #E8604A 0%, #FF8C69 100%)" }}
      >
        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/8" />
          <div className="absolute top-1/4 -left-16 w-48 h-48 rounded-full bg-white/6" />
          <div className="absolute bottom-1/4 right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/7" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-white/4" />
        </div>

        {/* Skip button */}
        <div className="flex justify-end px-5 pt-6 relative z-10">
          <button
            onClick={completeOnboarding}
            className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          <motion.img
            src={logoAkin}
            alt="Akin"
            className="h-12 mb-10 brightness-0 invert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-bold text-white font-heading mb-4 text-center"
          >
            Welcome to Akin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-white/75 leading-relaxed max-w-xs text-center"
          >
            Discover your next passion in Ann Arbor
          </motion.p>
        </div>

        {/* Bottom */}
        <div className="px-8 pb-10 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === 0 ? 28 : 8,
                  height: 8,
                  backgroundColor: i === 0 ? "#ffffff" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => paginate(1)}
            className="w-full h-14 rounded-full bg-white text-[#E8604A] font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
            whileTap={{ scale: 0.97 }}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // --- Regular onboarding slides (pages 1+) ---
  return (
    <motion.div
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: `hsl(${slide.bgToken})` }}
    >
      {/* Header area with logo */}
      <div className="flex items-center justify-between px-5 pt-6">
        <img src={theme === "dark" ? logoAkinDark : logoAkin} alt="Akin" className="h-7" />
        <button
          onClick={completeOnboarding}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
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
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
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

        <div className="flex gap-3">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => paginate(-1)}
            className="flex-1 h-14 rounded-2xl border-2 border-foreground/15 text-foreground font-semibold text-base hover:bg-foreground/5 transition-colors"
          >
            Back
          </motion.button>
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
