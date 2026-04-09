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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FDF6F0" }}>
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
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden relative"
      style={{ backgroundColor: "#FDF6F0" }}
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
          style={{ backgroundColor: "#F0E8E0" }}
        />
        <div
          className="absolute top-1/3 -left-20 w-56 h-56 rounded-full"
          style={{ backgroundColor: "#F0E8E0" }}
        />
        <div
          className="absolute -bottom-16 right-4 w-48 h-48 rounded-full"
          style={{ backgroundColor: "#F0E8E0" }}
        />
        <div
          className="absolute bottom-1/4 -left-8 w-32 h-32 rounded-full"
          style={{ backgroundColor: "#EDE4DC" }}
        />
      </div>

      {/* Logo — centered */}
      <div className="flex justify-center pt-12 relative z-10">
        <motion.img
          src={logoAkin}
          alt="Akin"
          className="h-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
      </div>

      {/* Content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold mb-8 text-center"
          style={{ color: "#2D2D2D" }}
        >
          I am a...
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 w-full"
        >
          {/* Hobby Seeker */}
          <button
            onClick={() => setUserType("seeker")}
            className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl min-h-[180px] transition-all duration-200 ${
              userType === "seeker"
                ? "shadow-lg scale-[1.02]"
                : "bg-white shadow-sm hover:shadow-md"
            }`}
            style={
              userType === "seeker"
                ? { backgroundColor: "#E8604A" }
                : undefined
            }
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: userType === "seeker" ? "#FFFFFF" : "#FEE8E0",
              }}
            >
              <Search className="w-6 h-6" style={{ color: "#E8604A" }} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: userType === "seeker" ? "#FFFFFF" : "#2D2D2D" }}
            >
              Hobby Seeker
            </span>
            <span
              className="text-xs leading-snug text-center"
              style={{
                color: userType === "seeker" ? "rgba(255,255,255,0.9)" : "#666666",
              }}
            >
              Explore and discover new hobbies
            </span>
          </button>

          {/* Business Owner */}
          <button
            onClick={() => setUserType("owner")}
            className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl min-h-[180px] transition-all duration-200 ${
              userType === "owner"
                ? "shadow-lg scale-[1.02]"
                : "bg-white shadow-sm hover:shadow-md"
            }`}
            style={
              userType === "owner"
                ? { backgroundColor: "#E8604A" }
                : undefined
            }
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: userType === "owner" ? "#FFFFFF" : "#FEE8E0",
              }}
            >
              <Store className="w-6 h-6" style={{ color: "#E8604A" }} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: userType === "owner" ? "#FFFFFF" : "#2D2D2D" }}
            >
              Business Owner
            </span>
            <span
              className="text-xs leading-snug text-center"
              style={{
                color: userType === "owner" ? "rgba(255,255,255,0.9)" : "#666666",
              }}
            >
              Manage your listings and analytics
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom — compact "Next >" pill */}
      <div className="flex justify-center pb-12 relative z-10">
        {userType && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full font-semibold text-sm text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#E8604A" }}
            whileTap={{ scale: 0.95 }}
          >
            Next &gt;
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default UserTypeSelection;
