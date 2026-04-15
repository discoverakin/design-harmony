import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import logoAkin from "@/assets/logo-akin.png";

const UserTypeSelection = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"seeker" | "owner" | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F9E9E4" }}>
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Already-logged-in users: route them based on their stored type
  if (user) {
    const stored = localStorage.getItem("akin-user-type");
    if (stored === "owner") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async () => {
    if (!userType) return;
    localStorage.setItem("akin-user-type", userType);
    if (user) {
      await supabase
        .from("profiles")
        .update({ user_type: userType })
        .eq("user_id", user.id);
      navigate(userType === "owner" ? "/dashboard" : "/home");
      return;
    }
    navigate(`/login?type=${userType}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-screen max-w-lg mx-auto relative overflow-hidden px-4 pt-12 pb-8"
      style={{ backgroundColor: "#F9E9E4" }}
    >
      {/* Decorative circles — z-0, pointer-events none */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            top: -80,
            right: -80,
            backgroundColor: "#FF5C3B",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            bottom: -60,
            left: -60,
            backgroundColor: "#FF5C3B",
            opacity: 0.1,
          }}
        />
      </div>

      {/* Logo */}
      <motion.img
        src={logoAkin}
        alt="Akin"
        className="h-8 mb-8 relative"
        style={{ zIndex: 1 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8 relative"
        style={{ fontSize: 26, fontWeight: 800, color: "#2D1810", zIndex: 1 }}
      >
        I am a...
      </motion.h1>

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex w-full mb-8 relative"
        style={{ gap: 12, zIndex: 1 }}
      >
        {/* Hobby Seeker */}
        <button
          onClick={() => setUserType("seeker")}
          className="flex-1 flex flex-col items-center text-center"
          style={{
            borderRadius: 24,
            padding: 20,
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: userType === "seeker" ? "#FF5C3B" : "#FFFFFF",
            border: userType === "seeker" ? "2px solid #FF5C3B" : "2px solid #F0D0C8",
            boxShadow: userType === "seeker" ? "0 8px 20px rgba(255, 92, 59, 0.3)" : "none",
            transform: userType === "seeker" ? "scale(1.03)" : "scale(1)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 60,
              height: 60,
              backgroundColor: userType === "seeker" ? "rgba(255,255,255,0.3)" : "#F9E9E4",
            }}
          >
            <Search
              style={{
                width: 26,
                height: 26,
                color: userType === "seeker" ? "#FFFFFF" : "#FF5C3B",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              marginTop: 12,
              color: userType === "seeker" ? "#FFFFFF" : "#2D1810",
            }}
          >
            Hobby Seeker
          </span>
          <span
            style={{
              fontSize: 13,
              marginTop: 8,
              lineHeight: 1.4,
              color: userType === "seeker" ? "rgba(255,255,255,0.85)" : "#8B6B61",
            }}
          >
            Explore and discover new hobbies
          </span>
        </button>

        {/* Business Owner */}
        <button
          onClick={() => setUserType("owner")}
          className="flex-1 flex flex-col items-center text-center"
          style={{
            borderRadius: 24,
            padding: 20,
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: userType === "owner" ? "#FF5C3B" : "#FFFFFF",
            border: userType === "owner" ? "2px solid #FF5C3B" : "2px solid #F0D0C8",
            boxShadow: userType === "owner" ? "0 8px 20px rgba(255, 92, 59, 0.3)" : "none",
            transform: userType === "owner" ? "scale(1.03)" : "scale(1)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 60,
              height: 60,
              backgroundColor: userType === "owner" ? "rgba(255,255,255,0.3)" : "#F9E9E4",
            }}
          >
            <Store
              style={{
                width: 26,
                height: 26,
                color: userType === "owner" ? "#FFFFFF" : "#FF5C3B",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              marginTop: 12,
              color: userType === "owner" ? "#FFFFFF" : "#2D1810",
            }}
          >
            Business Owner
          </span>
          <span
            style={{
              fontSize: 13,
              marginTop: 8,
              lineHeight: 1.4,
              color: userType === "owner" ? "rgba(255,255,255,0.85)" : "#8B6B61",
            }}
          >
            Manage your listings and analytics
          </span>
        </button>
      </motion.div>

      {/* Spacer — pushes button to bottom */}
      <div className="flex-1" />

      {/* Button */}
      <div className="relative flex flex-col items-center" style={{ zIndex: 1 }}>
        {userType ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            className="mb-4"
            style={{
              backgroundColor: "#FF5C3B",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 16,
              padding: "14px 48px",
              borderRadius: 50,
              border: "none",
              boxShadow: "0 4px 14px rgba(255, 92, 59, 0.35)",
              cursor: "pointer",
            }}
          >
            Get Started →
          </motion.button>
        ) : (
          <div
            className="mb-4"
            style={{
              color: "#C4A79E",
              fontWeight: 700,
              fontSize: 16,
              padding: "14px 48px",
              borderRadius: 50,
              backgroundColor: "rgba(255, 92, 59, 0.15)",
              cursor: "not-allowed",
            }}
          >
            Get Started →
          </div>
        )}

        <p style={{ fontSize: 14, color: "#8B6B61" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{
              color: "#FF5C3B",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Sign In
          </button>
        </p>
        <p style={{ fontSize: 14, color: "#8B6B61", marginTop: 8 }}>
          Don't have an account?{" "}
          {userType ? (
            <button
              onClick={() => navigate(`/signup?type=${userType}`)}
              style={{
                color: "#FF5C3B",
                fontWeight: 700,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sign Up
            </button>
          ) : (
            <span
              style={{
                color: "#C4A79E",
                fontWeight: 700,
                fontSize: 14,
                cursor: "not-allowed",
              }}
            >
              Sign Up
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default UserTypeSelection;
