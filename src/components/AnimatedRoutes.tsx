import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "@/pages/Index";
import Homepage from "@/pages/Homepage";
import HobbyDetail from "@/pages/HobbyDetail";
import Community from "@/pages/Community";
import HobbyQuiz from "@/pages/HobbyQuiz";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Homepage /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><HobbyQuiz /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/hobby/:slug" element={<PageTransition><HobbyDetail /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
