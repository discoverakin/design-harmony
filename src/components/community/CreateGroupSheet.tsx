import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["🎨", "🏃", "🎵", "📚", "👨‍🍳", "🎮", "📷", "🧘", "🎭", "🌱", "✈️", "🎸"];

const CATEGORY_OPTIONS = [
  "Arts & Crafts",
  "Sports",
  "Music",
  "Reading",
  "Cooking",
  "Gaming",
  "Photography",
  "Wellness",
  "Travel",
  "Other",
];

interface CreateGroupSheetProps {
  onCreateGroup: (data: {
    name: string;
    emoji: string;
    category: string;
    description: string;
    meetingSchedule: string;
    location: string;
  }) => void;
}

const CreateGroupSheet = ({ onCreateGroup }: CreateGroupSheetProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎨");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [location, setLocation] = useState("");

  const resetForm = () => {
    setName("");
    setEmoji("🎨");
    setCategory("Other");
    setDescription("");
    setMeetingSchedule("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a group name.");
      return;
    }
    if (trimmedName.length > 60) {
      toast.error("Group name must be under 60 characters.");
      return;
    }
    if (description.trim().length > 300) {
      toast.error("Description must be under 300 characters.");
      return;
    }

    onCreateGroup({
      name: trimmedName,
      emoji,
      category,
      description: description.trim(),
      meetingSchedule: meetingSchedule.trim(),
      location: location.trim(),
    });

    toast.success("Group created! 🎉");
    resetForm();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="rounded-full text-xs h-8 gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Create Group
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Create a New Group</SheetTitle>
          <SheetDescription>
            Start a hobby group and invite others to join.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="group-name" className="text-xs font-semibold">
              Group Name *
            </Label>
            <Input
              id="group-name"
              placeholder="e.g. Weekend Hikers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="h-10 rounded-xl bg-secondary/50 border-none text-sm"
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-secondary/60 hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="group-desc" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="group-desc"
              placeholder="What's your group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              className="rounded-xl bg-secondary/50 border-none text-sm resize-none"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {description.length}/300
            </p>
          </div>

          {/* Meeting Schedule */}
          <div className="space-y-1.5">
            <Label htmlFor="group-schedule" className="text-xs font-semibold">
              Meeting Schedule
            </Label>
            <Input
              id="group-schedule"
              placeholder="e.g. Every Saturday, 10 AM"
              value={meetingSchedule}
              onChange={(e) => setMeetingSchedule(e.target.value)}
              maxLength={100}
              className="h-10 rounded-xl bg-secondary/50 border-none text-sm"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="group-location" className="text-xs font-semibold">
              Location
            </Label>
            <Input
              id="group-location"
              placeholder="e.g. Central Park"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              className="h-10 rounded-xl bg-secondary/50 border-none text-sm"
            />
          </div>

          <Button type="submit" className="w-full rounded-xl h-11 font-semibold">
            Create Group
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateGroupSheet;
