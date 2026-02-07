import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GoalProgress } from "@/hooks/use-tracker-goals";

interface GoalCelebrationProps {
  goalProgress: GoalProgress | null;
  onDismiss: () => void;
}

const confettiEmojis = ["🎉", "🥳", "⭐", "✨", "🔥", "🏆", "💪", "🎊"];

const GoalCelebration = ({ goalProgress, onDismiss }: GoalCelebrationProps) => {
  useEffect(() => {
    if (goalProgress) {
      const timer = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timer);
    }
  }, [goalProgress, onDismiss]);

  return (
    <AnimatePresence>
      {goalProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={onDismiss}
        >
          {/* Floating confetti */}
          {confettiEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl pointer-events-none"
              initial={{
                opacity: 0,
                x: 0,
                y: 0,
                scale: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: (Math.random() - 0.5) * 240,
                y: -120 - Math.random() * 160,
                scale: [0, 1.3, 1, 0.6],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.6, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="bg-card rounded-3xl p-6 shadow-2xl max-w-[280px] w-full text-center mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl mb-3"
            >
              🏆
            </motion.div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Goal Complete!
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              {goalProgress.goal.emoji} {goalProgress.goal.label}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {Math.floor(goalProgress.currentMinutes / 60)}h{" "}
              {goalProgress.currentMinutes % 60}m this{" "}
              {goalProgress.goal.period === "weekly" ? "week" : "month"}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Awesome! 🎊
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalCelebration;
