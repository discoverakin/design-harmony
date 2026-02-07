import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HobbyHistoryCardProps {
  slug: string;
  emoji: string;
  label: string;
  sessions: number;
  lastActive: string;
  progress: number;
}

const HobbyHistoryCard = ({
  slug,
  emoji,
  label,
  sessions,
  lastActive,
  progress,
}: HobbyHistoryCardProps) => (
  <Link
    to={`/hobby/${slug}`}
    className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors"
  >
    <span className="text-2xl flex-shrink-0">{emoji}</span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className="text-[11px] text-muted-foreground">{lastActive}</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="text-[11px] font-medium text-muted-foreground min-w-[60px] text-right">
          {sessions} sessions
        </span>
      </div>
    </div>
    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
  </Link>
);

export default HobbyHistoryCard;
