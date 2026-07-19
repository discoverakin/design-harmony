import { useMatch } from "react-router-dom";
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
      onClick={() => {
        if (window.Tally) {
          window.Tally.openPopup('vGOkQQ', {
            layout: 'modal',
            width: 440,
            autoClose: 3000,
          });
        }
      }}
      className="fixed bottom-20 right-4 z-50 bg-white border-2
                 border-[#FF5C3B] text-[#FF5C3B] text-xs font-semibold
                 px-3 py-2 rounded-full shadow-lg hover:bg-[#FF5C3B]
                 hover:text-white transition-all"
    >
      Feedback
    </button>
  );
};

export default FeedbackButton;
