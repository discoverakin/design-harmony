import { Clock, Calendar, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ActivityLog } from "@/data/activity-log";

interface ActivityLogItemProps {
  log: ActivityLog;
  onDelete?: (id: string) => void;
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const ActivityLogItem = ({ log, onDelete }: ActivityLogItemProps) => {
  const dateObj = new Date(log.date + "T00:00:00");
  const isToday = log.date === new Date().toISOString().split("T")[0];
  const isYesterday =
    log.date === new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const dateLabel = isToday
    ? "Today"
    : isYesterday
    ? "Yesterday"
    : dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-border bg-card group">
      {/* Emoji */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary flex-shrink-0 text-xl">
        {log.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {log.hobbyName}
          </p>
          {log.source === "event" && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5 flex-shrink-0">
              <Zap className="w-2.5 h-2.5" />
              Event
            </Badge>
          )}
        </div>

        {log.note && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {log.note}
          </p>
        )}

        {log.eventTitle && (
          <p className="text-[11px] text-primary mt-0.5 truncate">
            📌 {log.eventTitle}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {formatTime(log.durationMinutes)}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {dateLabel}
          </span>
        </div>
      </div>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(log.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ActivityLogItem;
