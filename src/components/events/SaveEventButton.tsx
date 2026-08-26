import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedEvents } from "@/hooks/use-saved-events";

interface SaveEventButtonProps {
  eventId: string;
  /** Event title, for the button's accessible name. */
  title: string;
  /**
   * `overlay` floats on a card image; `plain` sits inline on a light surface.
   */
  variant?: "overlay" | "plain";
  className?: string;
}

/**
 * Save/unsave from a browsing card, without opening the event.
 *
 * A tester asked for this while scrolling the featured feed, and asked
 * specifically that it sit well away from "Book Now" so a thumb aiming at one
 * never lands on the other. Hence the overlay position — top corner of the
 * image, the far end of the card from the CTA — and a 36px target with the tap
 * stopped here so it never triggers a surrounding card link.
 */
const SaveEventButton = ({
  eventId,
  title,
  variant = "overlay",
  className,
}: SaveEventButtonProps) => {
  const { isSaved, toggleSave } = useSavedEvents();
  const saved = isSaved(eventId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      title={saved ? "Saved" : "Save for later"}
      onClick={(e) => {
        // Cards are wrapped in links; a save must not navigate.
        e.preventDefault();
        e.stopPropagation();
        toggleSave(eventId);
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors flex-shrink-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "overlay"
          ? "w-9 h-9 bg-card/90 backdrop-blur-sm shadow-sm hover:bg-card"
          : "w-9 h-9 hover:bg-secondary",
        className
      )}
    >
      <Bookmark
        className={cn(
          "w-4 h-4 transition-colors",
          saved ? "fill-primary text-primary" : "text-foreground"
        )}
      />
    </button>
  );
};

export default SaveEventButton;
