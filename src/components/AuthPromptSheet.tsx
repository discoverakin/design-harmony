import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface AuthPromptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  /** Optional override for the redirect target after auth. Defaults to current path. */
  pathname?: string;
}

/**
 * Dismissible auth prompt used to gate write actions on otherwise-public pages.
 * Reuses the safe `?redirect=` handling in Login/Signup so users return here after auth.
 */
const AuthPromptSheet = ({
  open,
  onOpenChange,
  title = "Sign up to continue",
  subtitle = "Create a free account to save your progress.",
  pathname,
}: AuthPromptSheetProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = pathname ?? location.pathname;
  const redirectQuery = `redirect=${encodeURIComponent(path)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-w-lg mx-auto pb-8"
      >
        <SheetHeader className="text-center mb-2">
          <SheetTitle className="text-lg font-bold text-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>
        <p className="text-sm text-muted-foreground text-center mb-5">
          {subtitle}
        </p>
        <button
          onClick={() => navigate(`/signup?type=seeker&${redirectQuery}`)}
          className="w-full h-12 rounded-2xl bg-[#FF5B3B] hover:bg-[#FF5B3B]/90 text-white font-semibold text-base mb-3 transition-colors"
        >
          Create Account
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate(`/login?type=seeker&${redirectQuery}`)}
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default AuthPromptSheet;
