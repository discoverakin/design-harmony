import { Users, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SocialProofStatsProps {
  variant?: "inline" | "grid";
  className?: string;
}

const STATS = [
  { icon: Users, value: "2,400+", label: "Active hobbyists", delay: 0 },
  { icon: Star, value: "4.9", label: "Avg rating", delay: 0.1 },
  { icon: Zap, value: "12K+", label: "Sessions logged", delay: 0.2 },
];

const SocialProofStats = ({ variant = "inline", className = "" }: SocialProofStatsProps) => {
  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-3 gap-3 ${className}`}>
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.4 }}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3"
          >
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground text-center">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stat.delay, duration: 0.4 }}
          className="flex items-center gap-1.5"
        >
          <stat.icon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">{stat.value}</span>
          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          {i < STATS.length - 1 && <span className="text-border ml-2">·</span>}
        </motion.div>
      ))}
    </div>
  );
};

export default SocialProofStats;
