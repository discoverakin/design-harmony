import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  CalendarPlus,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";

const emojiOptions = ["🎨", "🏃", "🎵", "👨‍🍳", "📚", "🎮", "🧘", "💃", "📸", "🎲", "🥾", "💪", "🏊", "🥋", "🧗", "🛹", "🧶", "🏺", "🪵", "🎬", "🌱", "🎯", "🎤", "🎭"];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [externalLink, setExternalLink] = useState("");
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [maxAttendees, setMaxAttendees] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5 MB.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFlyerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date || !time || !location.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title, date, time, and location.",
        variant: "destructive",
      });
      return;
    }

    addEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      emoji,
      externalLink: externalLink.trim() || undefined,
      flyerBase64: flyerPreview || undefined,
      createdBy: createdBy.trim() || "Anonymous",
      maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
    });

    toast({
      title: "Event created! 🎉",
      description: "Your event is now live. Share it with friends!",
    });

    navigate("/events");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-secondary">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground">Create Event</h2>
      </header>

      <main className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-t-3xl -mt-1 shadow-lg px-5 pt-6 pb-8 space-y-5"
        >
          {/* Flyer upload */}
          <div>
            <Label className="text-xs font-semibold text-foreground mb-2 block">
              Event Flyer (optional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFlyerUpload}
              className="hidden"
            />
            {flyerPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-border">
                <img
                  src={flyerPreview}
                  alt="Flyer preview"
                  className="w-full aspect-video object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFlyerPreview(null)}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors text-muted-foreground"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-medium">
                  Upload flyer from gallery
                </span>
              </button>
            )}
          </div>

          {/* External link */}
          <div>
            <Label htmlFor="externalLink" className="text-xs font-semibold text-foreground">
              Instagram / External Link (optional)
            </Label>
            <div className="relative mt-1.5">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="externalLink"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Event Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Outdoor Sketch Walk"
              className="mt-1.5 rounded-xl"
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-xs font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what to expect..."
              className="mt-1.5 rounded-xl min-h-[100px]"
              maxLength={500}
            />
          </div>

          {/* Date & Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date" className="text-xs font-semibold text-foreground">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-xs font-semibold text-foreground">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-xs font-semibold text-foreground">
              Location *
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Park, Main Entrance"
              className="mt-1.5 rounded-xl"
              maxLength={120}
            />
          </div>

          {/* Emoji picker (simple) */}
          <div>
            <Label className="text-xs font-semibold text-foreground">
              Event Emoji
            </Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {emojiOptions.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    emoji === em
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Max attendees */}
          <div>
            <Label htmlFor="maxAttendees" className="text-xs font-semibold text-foreground">
              Max Attendees (optional)
            </Label>
            <Input
              id="maxAttendees"
              type="number"
              min={1}
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Leave empty for unlimited"
              className="mt-1.5 rounded-xl"
            />
          </div>

          {/* Created by */}
          <div>
            <Label htmlFor="createdBy" className="text-xs font-semibold text-foreground">
              Your Name / Group Name
            </Label>
            <Input
              id="createdBy"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="e.g. Weekend Painters"
              className="mt-1.5 rounded-xl"
              maxLength={60}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full rounded-xl h-12 text-sm font-semibold gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Create Event
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Your event will be visible to all hobby seekers in the community.
          </p>
        </form>
      </main>
    </div>
  );
};

export default CreateEvent;
