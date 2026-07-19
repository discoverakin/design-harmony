import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/** Top strip inviting business owners to sign in. Only visible to logged-out users. */
const OwnerBanner = () => {
  const { user } = useAuth();
  if (user) return null;

  return (
    <div className="max-w-lg mx-auto bg-[#2D1810] text-center py-2 px-4 text-xs text-white">
      Business owner?{" "}
      <Link
        to="/login?type=owner"
        className="text-white font-semibold underline underline-offset-2 hover:opacity-90"
      >
        Sign in here
      </Link>
    </div>
  );
};

export default OwnerBanner;
