import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import PageTransition from "@/components/PageTransition";
import FeedbackButton from "@/components/FeedbackButton";
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
import Search from "@/pages/Search";
import Dashboard from "@/pages/dashboard/Dashboard";
import DashboardExperiences from "@/pages/dashboard/DashboardExperiences";
import DashboardExperienceNew from "@/pages/dashboard/DashboardExperienceNew";
import DashboardExperienceEdit from "@/pages/dashboard/DashboardExperienceEdit";
import DashboardPayments from "@/pages/dashboard/DashboardPayments";
import DashboardAnalytics from "@/pages/dashboard/DashboardAnalytics";
import DashboardGroups from "@/pages/dashboard/DashboardGroups";
import DashboardGroupDetail from "@/pages/dashboard/DashboardGroupDetail";
import DashboardMarketing from "@/pages/dashboard/DashboardMarketing";
import DashboardSettings from "@/pages/dashboard/DashboardSettings";

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

    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

/** Checks onboarding from profile (Supabase) with localStorage fallback */
const useHasCompletedOnboarding = () => {
  const { profile } = useProfile();
  return profile.hasCompletedOnboarding || localStorage.getItem("akin-onboarding-complete") === "true";
};

const HomeRoute = () => {
  const { user } = useAuth();
  const onboarded = useHasCompletedOnboarding();
  // Only force onboarding for logged-in users; anon visitors go straight to Index
  if (user && !onboarded) return <Navigate to="/onboarding" replace />;
  return <PageTransition><Index /></PageTransition>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Public browse routes */}
        <Route path="/home" element={<HomeRoute />} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/hobby/:slug" element={<PageTransition><HobbyDetail /></PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        {/* /events/:id is public — page-level signup wall handles auth */}
        <Route path="/events/:id" element={<PageTransition><EventDetail /></PageTransition>} />

        {/* Protected routes */}
        <Route path="/community" element={<RequireAuth><PageTransition><Community /></PageTransition></RequireAuth>} />
        <Route path="/community/:slug" element={<RequireAuth><PageTransition><GroupDetail /></PageTransition></RequireAuth>} />
        <Route path="/events/create" element={<RequireAuth><PageTransition><CreateEvent /></PageTransition></RequireAuth>} />
        <Route path="/admin-events" element={<RequireAuth><PageTransition><AdminEvents /></PageTransition></RequireAuth>} />
        <Route path="/tracker" element={<RequireAuth><PageTransition><HobbyTracker /></PageTransition></RequireAuth>} />
        <Route path="/quiz" element={<RequireAuth><PageTransition><HobbyQuiz /></PageTransition></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><PageTransition><Profile /></PageTransition></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><PageTransition><Settings /></PageTransition></RequireAuth>} />

        {/* Host Dashboard routes */}
        <Route path="/dashboard" element={<RequireAuth><PageTransition><Dashboard /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/experiences" element={<RequireAuth><PageTransition><DashboardExperiences /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/experiences/new" element={<RequireAuth><PageTransition><DashboardExperienceNew /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/experiences/:id" element={<RequireAuth><PageTransition><DashboardExperienceEdit /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/payments" element={<RequireAuth><PageTransition><DashboardPayments /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/analytics" element={<RequireAuth><PageTransition><DashboardAnalytics /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/groups" element={<RequireAuth><PageTransition><DashboardGroups /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/groups/:id" element={<RequireAuth><PageTransition><DashboardGroupDetail /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/marketing" element={<RequireAuth><PageTransition><DashboardMarketing /></PageTransition></RequireAuth>} />
        <Route path="/dashboard/settings" element={<RequireAuth><PageTransition><DashboardSettings /></PageTransition></RequireAuth>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    <FeedbackButton />
    </>
  );
};

export default AnimatedRoutes;
