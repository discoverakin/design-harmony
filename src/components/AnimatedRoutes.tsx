import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";

const hasCompletedOnboarding = () =>
  localStorage.getItem("akin-onboarding-complete") === "true";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            hasCompletedOnboarding() ? (
              <PageTransition><Index /></PageTransition>
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<PageTransition><Homepage /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/community/:slug" element={<PageTransition><GroupDetail /></PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/events/create" element={<PageTransition><CreateEvent /></PageTransition>} />
        <Route path="/events/:id" element={<PageTransition><EventDetail /></PageTransition>} />
        {/* Admin route hidden from hobby seekers — AdminEvents.tsx preserved for future admin role */}
        <Route path="/tracker" element={<PageTransition><HobbyTracker /></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><HobbyQuiz /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/hobby/:slug" element={<PageTransition><HobbyDetail /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
