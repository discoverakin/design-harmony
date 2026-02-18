import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const ACTIVITIES = [
  { name: "Sarah", action: "just joined", target: "Pottery Basics", emoji: "🎨" },
  { name: "Mike", action: "signed up for", target: "Thai Cooking Night", emoji: "👨‍🍳" },
  { name: "Ava", action: "completed", target: "Guitar Fundamentals", emoji: "🎸" },
  { name: "Josh", action: "just joined", target: "Photography Walk", emoji: "📷" },
  { name: "Priya", action: "is attending", target: "Open Mic Night", emoji: "🎵" },
  { name: "Leo", action: "started", target: "Watercolour Workshop", emoji: "🖌️" },
];

const ActivityToast = () => {
  const [current, setCurrent] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show first toast after 5s, then every 25s
    const initialDelay = setTimeout(() => {
      setCurrent(0);
      setVisible(true);
    }, 5000);

    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next = ((prev ?? -1) + 1) % ACTIVITIES.length;
        setVisible(true);
        return next;
      });
    }, 25000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      const hide = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(hide);
    }
  }, [visible, current]);

  if (current === null || !visible) return null;

  const activity = ACTIVITIES[current];

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border-2 border-border shadow-lg">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground">
            <span className="font-semibold">{activity.name}</span>{" "}
            {activity.action}{" "}
            <span className="font-semibold">{activity.target}</span>{" "}
            {activity.emoji}
          </p>
          <p className="text-[10px] text-muted-foreground">Just now</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityToast;
