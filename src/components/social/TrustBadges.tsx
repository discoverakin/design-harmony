import { ShieldCheck, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface TrustBadgesProps {
  className?: string;
}

const BADGES = [
  { icon: ShieldCheck, label: "Verified businesses", delay: 0 },
  { icon: Award, label: "Curated experiences", delay: 0.1 },
  { icon: Heart, label: "Community trusted", delay: 0.2 },
];

const TrustBadges = ({ className = "" }: TrustBadgesProps) => (
  <div className={`flex items-center justify-center gap-4 flex-wrap ${className}`}>
    {BADGES.map((badge) => (
      <motion.div
        key={badge.label}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: badge.delay, duration: 0.3 }}
        className="flex items-center gap-1.5"
      >
        <badge.icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-medium text-muted-foreground">{badge.label}</span>
      </motion.div>
    ))}
  </div>
);

export default TrustBadges;
