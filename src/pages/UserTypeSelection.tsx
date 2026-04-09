import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoAkin from "@/assets/logo-akin.png";

const UserTypeSelection = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"seeker" | "owner" | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = () => {
    if (!userType) return;
    localStorage.setItem("akin-user-type", userType);
    navigate(`/login?type=${userType}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden"
      style={{ background: "linear-gradient(180deg, #F4A896 0%, #F08070 100%)" }}
    >
      {/* Logo — top left */}
      <div className="px-6 pt-8">
        <motion.img
          src={logoAkin}
          alt="Akin"
          className="h-8 brightness-0 invert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
      </div>

      {/* Content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white font-heading mb-2 text-center"
        >
          Welcome to Akin!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base text-white/80 mb-10 text-center"
        >
          Discover your next passion or grow your business
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 w-full"
        >
          {/* Hobby Seeker */}
          <button
            onClick={() => setUserType("seeker")}
            className={`flex-1 flex flex-col items-center justify-center gap-4 p-6 rounded-2xl min-h-[200px] transition-all duration-200 ${
              userType === "seeker"
                ? "bg-white shadow-xl scale-[1.02]"
                : "bg-white/25 border border-white/30 hover:bg-white/35"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
              <Search className="w-6 h-6 text-[#E8604A]" />
            </div>
            <span
              className={`text-base font-bold ${
                userType === "seeker" ? "text-[#E8604A]" : "text-white"
              }`}
            >
              Hobby Seeker
            </span>
            <span
              className={`text-xs leading-snug text-center ${
                userType === "seeker" ? "text-[#E8604A]/60" : "text-white/70"
              }`}
            >
              Explore and discover new hobbies
            </span>
          </button>

          {/* Business Owner */}
          <button
            onClick={() => setUserType("owner")}
            className={`flex-1 flex flex-col items-center justify-center gap-4 p-6 rounded-2xl min-h-[200px] transition-all duration-200 ${
              userType === "owner"
                ? "bg-white shadow-xl scale-[1.02]"
                : "bg-white/25 border border-white/30 hover:bg-white/35"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
              <Store className="w-6 h-6 text-[#E8604A]" />
            </div>
            <span
              className={`text-base font-bold ${
                userType === "owner" ? "text-[#E8604A]" : "text-white"
              }`}
            >
              Business Owner
            </span>
            <span
              className={`text-xs leading-snug text-center ${
                userType === "owner" ? "text-[#E8604A]/60" : "text-white/70"
              }`}
            >
              Manage your listings and analytics
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-10">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleSubmit}
          disabled={!userType}
          className={`w-full h-14 rounded-full font-semibold text-base shadow-lg transition-all duration-200 ${
            userType
              ? "bg-white text-[#E8604A] hover:opacity-90"
              : "bg-white/40 text-white/60 cursor-not-allowed"
          }`}
          whileTap={userType ? { scale: 0.97 } : undefined}
        >
          Get Started →
        </motion.button>

        <p className="text-center text-sm text-white/50 mt-5">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-white font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default UserTypeSelection;
