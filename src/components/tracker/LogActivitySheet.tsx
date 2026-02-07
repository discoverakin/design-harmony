import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { ActivityLog } from "@/data/activity-log";

const hobbyOptions: { name: string; emoji: string }[] = [
  { name: "Painting", emoji: "🎨" },
  { name: "Music", emoji: "🎵" },
  { name: "Photography", emoji: "📸" },
  { name: "Knitting", emoji: "🧶" },
  { name: "Pottery", emoji: "🏺" },
  { name: "Woodworking", emoji: "🪵" },
  { name: "Film & Video", emoji: "🎬" },
  { name: "Running", emoji: "🏃" },
  { name: "Yoga", emoji: "🧘" },
  { name: "Dance", emoji: "💃" },
  { name: "Hiking", emoji: "🥾" },
  { name: "Fitness", emoji: "💪" },
  { name: "Swimming", emoji: "🏊" },
  { name: "Martial Arts", emoji: "🥋" },
  { name: "Rock Climbing", emoji: "🧗" },
  { name: "Cycling", emoji: "🚴" },
  { name: "Cooking", emoji: "👨‍🍳" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Reading", emoji: "📚" },
  { name: "Chess", emoji: "♟️" },
  { name: "Writing", emoji: "✍️" },
  { name: "Coding", emoji: "💻" },
  { name: "Gardening", emoji: "🌱" },
];

interface LogActivitySheetProps {
  onLog: (log: Omit<ActivityLog, "id">) => void;
}

const LogActivitySheet = ({ onLog }: LogActivitySheetProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [hobby, setHobby] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setHobby("");
    setHours("");
    setMinutes("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = () => {
    const totalMinutes =
      (parseInt(hours || "0", 10) || 0) * 60 + (parseInt(minutes || "0", 10) || 0);

    if (!hobby) {
      toast({
        title: "Select an activity",
        description: "Choose which hobby you practiced.",
        variant: "destructive",
      });
      return;
    }

    if (totalMinutes <= 0) {
      toast({
        title: "Add duration",
        description: "Log at least 1 minute of activity.",
        variant: "destructive",
      });
      return;
    }

    const selectedHobby = hobbyOptions.find((h) => h.name === hobby);

    onLog({
      hobbyName: hobby,
      emoji: selectedHobby?.emoji || "🎯",
      durationMinutes: totalMinutes,
      date,
      note: note.trim() || undefined,
      source: "manual",
    });

    toast({
      title: "Activity logged! 💪",
      description: `${hobby} — ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full gap-1.5" size="sm">
          <Plus className="w-4 h-4" />
          Log Activity
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-lg mx-auto pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">Log Activity</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pt-2">
          {/* Activity */}
          <div>
            <Label className="text-xs font-semibold">Activity</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {hobbyOptions.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => setHobby(h.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                    hobby === h.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {h.emoji} {h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-xs font-semibold">Duration</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="rounded-xl text-center"
                />
                <span className="text-xs text-muted-foreground font-medium">hr</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="30"
                  className="rounded-xl text-center"
                />
                <span className="text-xs text-muted-foreground font-medium">min</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="log-date" className="text-xs font-semibold">
              Date
            </Label>
            <Input
              id="log-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="log-note" className="text-xs font-semibold">
              Note (optional)
            </Label>
            <Textarea
              id="log-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How was it? What did you do?"
              className="mt-1.5 rounded-xl min-h-[72px]"
              maxLength={200}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full rounded-xl h-11 text-sm font-semibold"
          >
            Save Activity
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LogActivitySheet;
