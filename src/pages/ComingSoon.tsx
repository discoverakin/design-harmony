import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-screen max-w-lg mx-auto overflow-hidden"
      style={{ background: "linear-gradient(160deg, #E8604A 0%, #FF8C69 100%)" }}
    >
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-7xl mb-6 block"
        >
          🚀
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white text-center mb-3"
        >
          Host Dashboard Coming Soon
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base text-white/75 text-center leading-relaxed max-w-xs mb-8"
        >
          We're building tools for studios and instructors. Drop your email to get early access.
        </motion.p>

        {!emailSent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-xs flex flex-col gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-12 rounded-xl px-4 text-sm text-foreground bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={() => {
                if (email.trim()) setEmailSent(true);
              }}
              className="w-full h-12 rounded-xl bg-white text-[#E8604A] font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
            >
              Notify Me
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-lg font-semibold text-white">
              Thanks! We'll be in touch 🎉
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ComingSoon;
