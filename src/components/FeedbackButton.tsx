import { useMatch } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: object) => void;
    };
  }
}

const FeedbackButton = () => {
  const { user } = useAuth();
  const eventDetailMatch = useMatch("/events/:id");
  // Hide only on /events/:id for logged-out users — avoids collision with the RSVP overlay.
  // Excludes /events/create (also matches "/events/:id") since that route is auth-gated anyway.
  const isEventDetailPage =
    !!eventDetailMatch && eventDetailMatch.params.id !== "create";

  if (isEventDetailPage && !user) return null;

  return (
    <button
      aria-label="Feedback"
      onClick={() => {
        if (window.Tally) {
          window.Tally.openPopup('vGOkQQ', {
            layout: 'modal',
            width: 440,
            autoClose: 3000,
          });
        }
      }}
      className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full
                 bg-[#E8604A] text-white shadow-lg hover:bg-[#E8604A]/90
                 transition-colors flex items-center justify-center"
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
};

export default FeedbackButton;
