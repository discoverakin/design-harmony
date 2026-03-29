import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import PageTransition from "@/components/PageTransition";
import Index from "@/pages/Index";
import Homepage from "@/pages/Homepage";
import HobbyDetail from "@/pages/HobbyDetail";
import Community from "@/pages/Community";
import GroupDetail from "@/pages/GroupDetail";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import CreateEvent from "@/pages/CreateEvent";
import HobbyTracker from "@/pages/HobbyTracker";
import HobbyQuiz from "@/pages/HobbyQuiz";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminEvents from "@/pages/AdminEvents";

/** Redirects unauthenticated visitors to /login, preserving payment return context */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success" || paymentStatus === "cancel") {
      const redirectPath = location.pathname;
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
      return <Navigate to={`/login?payment=${paymentStatus}&redirect=${encodeURIComponent(redirectPath)}`} replace />;
    }

    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/** Checks onboarding from profile (Supabase) with localStorage fallback */
const useHasCompletedOnboarding = () => {
  const { profile } = useProfile();
  return profile.hasCompletedOnboarding || localStorage.getItem("akin-onboarding-complete") === "true";
};

const HomeRoute = () => {
  const onboarded = useHasCompletedOnboarding();
  return onboarded ? (
    <PageTransition><Index /></PageTransition>
  ) : (
    <Navigate to="/onboarding" replace />
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomeRoute />
            </RequireAuth>
          }
        />
        <Route path="/home" element={<RequireAuth><PageTransition><Homepage /></PageTransition></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><PageTransition><Community /></PageTransition></RequireAuth>} />
        <Route path="/community/:slug" element={<RequireAuth><PageTransition><GroupDetail /></PageTransition></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><PageTransition><Events /></PageTransition></RequireAuth>} />
        <Route path="/events/create" element={<RequireAuth><PageTransition><CreateEvent /></PageTransition></RequireAuth>} />
        <Route path="/events/:id" element={<RequireAuth><PageTransition><EventDetail /></PageTransition></RequireAuth>} />
        <Route path="/admin-events" element={<RequireAuth><PageTransition><AdminEvents /></PageTransition></RequireAuth>} />
        <Route path="/tracker" element={<RequireAuth><PageTransition><HobbyTracker /></PageTransition></RequireAuth>} />
        <Route path="/quiz" element={<RequireAuth><PageTransition><HobbyQuiz /></PageTransition></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><PageTransition><Profile /></PageTransition></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><PageTransition><Settings /></PageTransition></RequireAuth>} />
        <Route path="/hobby/:slug" element={<RequireAuth><PageTransition><HobbyDetail /></PageTransition></RequireAuth>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
