import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommunityGroup } from "@/data/community";

interface GroupCardProps {
  group: CommunityGroup;
  joined: boolean;
  onToggleJoin: (groupId: number) => void;
}

const GroupCard = ({ group, joined, onToggleJoin }: GroupCardProps) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card">
      <Link
        to={`/community/${group.slug}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div
          className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
          style={{ backgroundColor: group.bgColor }}
        >
          <span className="text-xl">{group.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {group.name}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {group.members} members · {group.category}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </Link>
      <Button
        variant={joined ? "secondary" : "default"}
        size="sm"
        className="rounded-full text-xs h-8 px-4 flex-shrink-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleJoin(group.id);
        }}
      >
        {joined ? "Joined" : "Join"}
      </Button>
    </div>
  );
};

export default GroupCard;
