import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import logoAkin from "@/assets/logo-akin.png";
import logoAkinDark from "@/assets/logo-akin-dark.png";


const Signup = () => {
  const { signUp, user } = useAuth();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type") as "seeker" | "owner" | null;
  const [selectedType, setSelectedType] = useState<"seeker" | "owner" | null>(typeFromUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalType = typeFromUrl || selectedType;
    if (!finalType) {
      setError("Please select whether you're a Hobby Seeker or Business Owner.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    localStorage.setItem("akin-user-type", finalType);
    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      await supabase
        .from("profiles")
        .update({ user_type: finalType })
        .eq("user_id", newUser.id);
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center px-5 pt-6">
        <img
          src={theme === "dark" ? logoAkinDark : logoAkin}
          alt="Akin"
          className="h-7"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Type badge or toggle */}
          {typeFromUrl ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: "rgba(255, 92, 59, 0.12)", color: "#FF5C3B" }}
            >
              {typeFromUrl === "seeker" ? "🎨 Signing up as Hobby Seeker" : "🏢 Signing up as Business Owner"}
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedType("seeker")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: selectedType === "seeker" ? "#FF5C3B" : "rgba(255, 92, 59, 0.12)",
                  color: selectedType === "seeker" ? "#FFFFFF" : "#FF5C3B",
                }}
              >
                🎨 Hobby Seeker
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("owner")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: selectedType === "owner" ? "#FF5C3B" : "rgba(255, 92, 59, 0.12)",
                  color: selectedType === "owner" ? "#FFFFFF" : "#FF5C3B",
                }}
              >
                🏢 Business Owner
              </button>
            </div>
          )}

          <div className="w-16 h-16 rounded-full bg-brand-creamsicle/30 flex items-center justify-center mb-6">
            <span className="text-3xl">🚀</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground font-heading mb-1">
            Create your account
          </h1>
          <p className="text-muted-foreground mb-8">
            Join Akin and start discovering hobbies you'll love.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl mb-3">✉️</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                We've sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
              <Link
                to="/login"
                className="text-primary font-semibold text-sm hover:underline"
              >
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-12 rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full h-12 rounded-xl border border-border bg-card px-4 pr-12 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full h-12 rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>

            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
