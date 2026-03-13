import { motion } from "framer-motion";

const RECENT = [
  { name: "Alex", emoji: "😊", time: "2m ago" },
  { name: "Jordan", emoji: "🤩", time: "5m ago" },
  { name: "Taylor", emoji: "😄", time: "12m ago" },
  { name: "Sam", emoji: "🥳", time: "18m ago" },
];

interface RecentJoinersProps {
  className?: string;
}

const RecentJoiners = ({ className = "" }: RecentJoinersProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3, duration: 0.4 }}
    className={`flex items-center gap-2 ${className}`}
  >
    <div className="flex -space-x-2">
      {RECENT.map((person, i) => (
        <div
          key={person.name}
          className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-sm"
        >
          {person.emoji}
        </div>
      ))}
    </div>
    <span className="text-[11px] text-muted-foreground">
      <span className="font-semibold text-foreground">{RECENT[0].name}</span> and{" "}
      <span className="font-semibold text-foreground">{RECENT.length - 1} others</span> joined recently
    </span>
  </motion.div>
);

export default RecentJoiners;
