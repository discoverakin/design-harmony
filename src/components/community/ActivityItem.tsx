import { useState } from "react";
import { Heart } from "lucide-react";
import type { ActivityFeedItem } from "@/data/community";

interface ActivityItemProps {
  item: ActivityFeedItem;
}

const ActivityItem = ({ item }: ActivityItemProps) => {
  const [liked, setLiked] = useState(false);
  const likeCount = liked ? item.likes + 1 : item.likes;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary flex-shrink-0 text-lg">
        {item.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{item.user}</span>{" "}
          <span className="text-muted-foreground">{item.action}</span>{" "}
          <span className="font-medium">{item.target}</span>
          {item.badge && <span className="ml-1">{item.badge}</span>}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-muted-foreground">{item.time}</span>
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                liked ? "fill-primary text-primary" : ""
              }`}
            />
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
