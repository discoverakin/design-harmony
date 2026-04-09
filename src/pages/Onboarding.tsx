import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store, ArrowLeft } from "lucide-react";
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

// Total steps: welcome (0) + user type (1) + slides (2..4)
const TOTAL_DOTS = 1 + 1 + 3; // 5

const Onboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { updateProfile } = useProfile();
  const [[page, direction], setPage] = useState([0, 0]);
  const [userType, setUserType] = useState<"seeker" | "owner" | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next < 0) return;

    if (page === 1 && newDirection > 0) {
      // From user type selection — require a choice
      if (!userType) return;
      if (userType === "owner") {
        setShowComingSoon(true);
        return;
      }
      localStorage.setItem("akin-user-type", "seeker");
    }

    // Check if we've passed all slides
    const totalPages = 2 + slides.length; // welcome + user type + slides
    if (next >= totalPages) {
      completeOnboarding();
      return;
    }

    setPage([next, newDirection]);
  };

  const completeOnboarding = async () => {
    localStorage.setItem("akin-onboarding-complete", "true");
    await updateProfile({ hasCompletedOnboarding: true });
    navigate("/", { replace: true });
  };

  const slideIndex = page - 2; // slides start at page 2
  const slide = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;

  // --- Coming Soon screen for Business Owners ---
  if (showComingSoon) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden"
        style={{ background: "linear-gradient(160deg, #E8604A 0%, #FF8C69 100%)" }}
      >
        <div className="px-5 pt-6">
          <button
            onClick={() => {
              setShowComingSoon(false);
              setEmailSent(false);
              setEmail("");
            }}
            className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-7xl mb-6 block"
          >
            🚀
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white text-center mb-3"
          >
            Host Dashboard Coming Soon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-white/75 text-center leading-relaxed max-w-xs mb-8"
          >
            We're building tools for studios and instructors. Drop your email to get early access.
          </motion.p>

          {!emailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-xs flex flex-col gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 rounded-xl px-4 text-sm text-foreground bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => {
                  if (email.trim()) {
                    localStorage.setItem("akin-user-type", "owner");
                    setEmailSent(true);
                  }
                }}
                className="w-full h-12 rounded-xl bg-white text-[#E8604A] font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
              >
                Notify Me
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-lg font-semibold text-white">
                Thanks! We'll be in touch 🎉
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

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
            Get Started
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // --- User type selection (page 1) ---
  if (page === 1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden"
        style={{ backgroundColor: "hsl(var(--brand-cream))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button
            onClick={() => setPage([0, -1])}
            className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={completeOnboarding}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-foreground font-heading mb-2 text-center"
          >
            I am a...
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mb-8 text-center"
          >
            Choose how you'll use Akin
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 w-full max-w-sm"
          >
            {/* Hobby Seeker card */}
            <button
              onClick={() => setUserType("seeker")}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
                userType === "seeker"
                  ? "bg-[#E8604A] border-[#E8604A] text-white shadow-lg scale-[1.02]"
                  : "bg-white border-border text-foreground hover:border-[#E8604A]/30"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  userType === "seeker" ? "bg-white/20" : "bg-[#E8604A]/10"
                }`}
              >
                <Search
                  className={`w-7 h-7 ${
                    userType === "seeker" ? "text-white" : "text-[#E8604A]"
                  }`}
                />
              </div>
              <span className="text-base font-semibold">Hobby Seeker</span>
              <span
                className={`text-xs leading-snug text-center ${
                  userType === "seeker" ? "text-white/75" : "text-muted-foreground"
                }`}
              >
                Explore and discover new hobbies
              </span>
            </button>

            {/* Business Owner card */}
            <button
              onClick={() => setUserType("owner")}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
                userType === "owner"
                  ? "bg-[#E8604A] border-[#E8604A] text-white shadow-lg scale-[1.02]"
                  : "bg-white border-border text-foreground hover:border-[#E8604A]/30"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  userType === "owner" ? "bg-white/20" : "bg-[#E8604A]/10"
                }`}
              >
                <Store
                  className={`w-7 h-7 ${
                    userType === "owner" ? "text-white" : "text-[#E8604A]"
                  }`}
                />
              </div>
              <span className="text-base font-semibold">Business Owner</span>
              <span
                className={`text-xs leading-snug text-center ${
                  userType === "owner" ? "text-white/75" : "text-muted-foreground"
                }`}
              >
                Manage your listings and analytics
              </span>
            </button>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="px-8 pb-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                animate={{
                  width: i === 1 ? 28 : 8,
                  backgroundColor:
                    i === 1
                      ? "hsl(var(--brand-orange))"
                      : "hsl(var(--brand-dark-brown) / 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ height: 8 }}
              />
            ))}
          </div>

          {userType && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => paginate(1)}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
              whileTap={{ scale: 0.97 }}
            >
              Next →
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // --- Regular onboarding slides (pages 2+) ---
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

        {/* Action buttons */}
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
