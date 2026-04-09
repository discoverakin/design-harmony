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
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden relative"
      style={{ background: "linear-gradient(160deg, #E8604A 0%, #FF8C69 100%)" }}
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/8" />
        <div className="absolute top-1/4 -left-16 w-48 h-48 rounded-full bg-white/6" />
        <div className="absolute bottom-1/4 right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/7" />
      </div>

      {/* Logo */}
      <div className="px-5 pt-8 relative z-10">
        <motion.img
          src={logoAkin}
          alt="Akin"
          className="h-10 brightness-0 invert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white font-heading mb-2"
        >
          Welcome to Akin
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base text-white/70 mb-10"
        >
          Tell us who you are to get started
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          {/* Hobby Seeker */}
          <button
            onClick={() => setUserType("seeker")}
            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
              userType === "seeker"
                ? "bg-white border-white text-[#E8604A] shadow-lg scale-[1.02]"
                : "bg-white/15 border-white/20 text-white hover:bg-white/25"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                userType === "seeker" ? "bg-[#E8604A]/10" : "bg-white/15"
              }`}
            >
              <Search
                className={`w-7 h-7 ${
                  userType === "seeker" ? "text-[#E8604A]" : "text-white"
                }`}
              />
            </div>
            <span className="text-base font-semibold">Hobby Seeker</span>
            <span
              className={`text-xs leading-snug text-center ${
                userType === "seeker" ? "text-[#E8604A]/70" : "text-white/60"
              }`}
            >
              Explore and discover new hobbies
            </span>
          </button>

          {/* Business Owner */}
          <button
            onClick={() => setUserType("owner")}
            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
              userType === "owner"
                ? "bg-white border-white text-[#E8604A] shadow-lg scale-[1.02]"
                : "bg-white/15 border-white/20 text-white hover:bg-white/25"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                userType === "owner" ? "bg-[#E8604A]/10" : "bg-white/15"
              }`}
            >
              <Store
                className={`w-7 h-7 ${
                  userType === "owner" ? "text-[#E8604A]" : "text-white"
                }`}
              />
            </div>
            <span className="text-base font-semibold">Business Owner</span>
            <span
              className={`text-xs leading-snug text-center ${
                userType === "owner" ? "text-[#E8604A]/70" : "text-white/60"
              }`}
            >
              Manage your listings and analytics
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-10 relative z-10">
        {userType && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="w-full h-14 rounded-full bg-white text-[#E8604A] font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
            whileTap={{ scale: 0.97 }}
          >
            Get Started →
          </motion.button>
        )}

        <p className="text-center text-sm text-white/50 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-white font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default UserTypeSelection;
