import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { GoalPeriod } from "@/data/tracker-goals";

interface AddGoalSheetProps {
  onAdd: (goal: {
    label: string;
    emoji: string;
    targetMinutes: number;
    period: GoalPeriod;
  }) => void;
}

const emojiOptions = ["🏃", "🎨", "📚", "🧘", "🎵", "👨‍🍳", "📸", "🎮", "🏊", "💻"];

const AddGoalSheet = ({ onAdd }: AddGoalSheetProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [hours, setHours] = useState("");
  const [period, setPeriod] = useState<GoalPeriod>("weekly");

  const reset = () => {
    setLabel("");
    setEmoji("🎯");
    setHours("");
    setPeriod("weekly");
  };

  const handleSubmit = () => {
    const h = parseFloat(hours || "0");
    if (!label.trim() || h <= 0) return;

    onAdd({
      label: label.trim(),
      emoji,
      targetMinutes: Math.round(h * 60),
      period,
    });
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center gap-1.5 w-full p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" />
          Add Goal
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-lg mx-auto pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            New Goal
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pt-2">
          {/* Emoji picker */}
          <div>
            <Label className="text-xs font-semibold">Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    emoji === e
                      ? "bg-primary/15 ring-2 ring-primary scale-110"
                      : "bg-secondary/60 hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <Label className="text-xs font-semibold">Goal name *</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Practice 5 hours this week"
              className="mt-1.5 rounded-xl"
            />
          </div>

          {/* Target hours */}
          <div>
            <Label className="text-xs font-semibold">Target hours *</Label>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="5"
              className="mt-1.5 rounded-xl"
            />
          </div>

          {/* Period */}
          <div>
            <Label className="text-xs font-semibold">Period</Label>
            <div className="flex gap-2 mt-1.5">
              {(["weekly", "monthly"] as GoalPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-foreground hover:bg-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!label.trim() || !hours || parseFloat(hours) <= 0}
            className="w-full rounded-xl h-11 text-sm font-semibold"
          >
            Create Goal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddGoalSheet;
