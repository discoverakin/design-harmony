import { Share2, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "icon" | "full";
}

const ShareButton = ({ title, text, url, variant = "icon" }: ShareButtonProps) => {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url: shareUrl });
    } catch {
      // User cancelled or not supported — fall through
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied! 🔗", description: "Share it with your friends." });
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  const handleSendToFriend = () => {
    const msg = encodeURIComponent(`${title}\n${text}\n${shareUrl}`);
    // Try SMS/messaging as universal fallback
    const smsUrl = `sms:?body=${msg}`;
    window.open(smsUrl, "_blank");
  };

  // If native share is available, use it directly
  if (typeof navigator !== "undefined" && navigator.share) {
    if (variant === "full") {
      return (
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="w-full rounded-xl h-11 text-sm font-semibold gap-2 border-2"
        >
          <Send className="w-4 h-4" />
          Send to a Friend
        </Button>
      );
    }
    return (
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Share2 className="w-5 h-5 text-foreground" />
      </button>
    );
  }

  // Fallback: popover with copy + SMS options
  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === "full" ? (
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 text-sm font-semibold gap-2 border-2"
          >
            <Send className="w-4 h-4" />
            Send to a Friend
          </Button>
        ) : (
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-foreground"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
          Copy link
        </button>
        <button
          onClick={handleSendToFriend}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-foreground"
        >
          <Send className="w-4 h-4 text-muted-foreground" />
          Send via message
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
