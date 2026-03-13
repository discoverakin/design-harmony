import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle } from "lucide-react";

const LIVE_MESSAGES = [
  "23 people exploring hobbies right now",
  "Sarah just joined a pottery group",
  "5 new hobby classes added this week",
  "Marcus completed his 10th climbing session",
  "12 events happening near you this weekend",
];

interface LiveActivityBannerProps {
  className?: string;
}

const LiveActivityBanner = ({ className = "" }: LiveActivityBannerProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 ${className}`}>
      <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-[11px] text-foreground font-medium"
        >
          {LIVE_MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityBanner;
