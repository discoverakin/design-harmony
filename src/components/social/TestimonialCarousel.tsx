import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  hobby: string;
  emoji: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah K.",
    hobby: "Pottery",
    emoji: "🎨",
    quote: "Akin helped me find a pottery class I never knew existed near me. Life-changing!",
    rating: 5,
  },
  {
    name: "Marcus D.",
    hobby: "Rock Climbing",
    emoji: "🧗",
    quote: "I went from zero hobbies to three in one month. The matching is scarily good.",
    rating: 5,
  },
  {
    name: "Priya M.",
    hobby: "Cooking",
    emoji: "👨‍🍳",
    quote: "Found my Thai cooking community through Akin. Best decision this year.",
    rating: 5,
  },
  {
    name: "James L.",
    hobby: "Photography",
    emoji: "📸",
    quote: "The recommendations felt personal, not generic. It actually gets me.",
    rating: 5,
  },
];

interface TestimonialCarouselProps {
  className?: string;
  compact?: boolean;
}

const TestimonialCarousel = ({ className = "", compact = false }: TestimonialCarouselProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className={`rounded-xl border border-border bg-card ${compact ? "p-3" : "p-4"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base flex-shrink-0">
              {t.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.hobby} enthusiast</p>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />
              ))}
            </div>
          </div>
          <p className={`text-muted-foreground italic leading-relaxed ${compact ? "text-[11px]" : "text-xs"}`}>
            "{t.quote}"
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === current ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
