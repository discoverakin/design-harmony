import { Flame, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingBadgeProps {
  variant?: "hot" | "popular" | "new";
  className?: string;
}

const config = {
  hot: { icon: Flame, label: "Trending 🔥", bg: "bg-destructive/10 text-destructive" },
  popular: { icon: TrendingUp, label: "Popular", bg: "bg-primary/10 text-primary" },
  new: { icon: null, label: "New ✨", bg: "bg-accent text-accent-foreground" },
};

const TrendingBadge = ({ variant = "hot", className }: TrendingBadgeProps) => {
  const { icon: Icon, label, bg } = config[variant];

  return (
    <Badge className={`text-[9px] px-1.5 py-0 border-0 gap-0.5 font-semibold ${bg} ${className ?? ""}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </Badge>
  );
};

export default TrendingBadge;
