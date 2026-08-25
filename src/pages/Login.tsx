import { useState } from "react";
import { Link, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import logoAkin from "@/assets/logo-akin.png";
import logoAkinDark from "@/assets/logo-akin-dark.png";


/** Supabase's raw strings are developer-facing; translate the ones we know. */
function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "That email and password don't match an Akin account.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email — check your inbox for the link.";
  }
  if (/rate limit/i.test(message)) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message;
}

const Login = () => {
  const { signIn, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAccountEmail, setNoAccountEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paymentStatus = searchParams.get("payment");
  const rawRedirect = searchParams.get("redirect") || sessionStorage.getItem("redirectAfterLogin");
  // Only allow internal relative paths — must start with "/" but not "//" (protocol-relative)
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;
  const isPaymentReturn = paymentStatus === "success";
  const userType = searchParams.get("type");

  /**
   * Sign-up link carrying the typed email plus any redirect/type context, so
   * a user who lands here without an account doesn't lose their place.
   */
  const buildSignupHref = (prefillEmail?: string): string => {
    const params = new URLSearchParams();
    if (prefillEmail) params.set("email", prefillEmail);
    if (safeRedirect) params.set("redirect", safeRedirect);
    if (userType) params.set("type", userType);
    const qs = params.toString();
    return qs ? `/signup?${qs}` : "/signup";
  };

  const buildRedirectTarget = (): string | null => {
    if (!safeRedirect) return null;
    if (paymentStatus) {
      const sep = safeRedirect.includes("?") ? "&" : "?";
      return `${safeRedirect}${sep}payment=${paymentStatus}`;
    }
    return safeRedirect;
  };

  if (user) {
    const target = buildRedirectTarget();
    if (target) {
      sessionStorage.removeItem("redirectAfterLogin");
      return <Navigate to={target} replace />;
    }
    if (userType === "owner") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNoAccountEmail(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      // Supabase returns one message for both "wrong password" and "no such
      // account". Only that ambiguous case is worth a lookup; other errors
      // (unconfirmed email, rate limits) already say what went wrong.
      if (/invalid login credentials/i.test(error)) {
        try {
          const res = await fetch("/api/account-exists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const { exists } = await res.json();
            if (exists === false) {
              setNoAccountEmail(email);
              setLoading(false);
              return;
            }
            if (exists === true) {
              setError("Incorrect password.");
              setLoading(false);
              return;
            }
          }
        } catch {
          // Lookup unavailable — fall through to the generic message.
        }
      }
      setError(friendlyAuthError(error));
      setLoading(false);
      return;
    }
    const target = buildRedirectTarget();
    if (target) {
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(target, { replace: true });
    } else if (userType === "owner") {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
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
          {isPaymentReturn && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-green-500/10 border-2 border-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-700">
                Payment successful! Sign in to view your booking 🎉
              </p>
            </div>
          )}

          <div className="w-16 h-16 rounded-full bg-brand-creamsicle/30 flex items-center justify-center mb-6">
            <span className="text-3xl">👋</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground font-heading mb-1">
            {userType === "seeker"
              ? <span>Welcome, hobby seeker! <span className="text-[#FF5B3B]">🎨</span></span>
              : userType === "owner"
              ? <span>Welcome, studio owner! <span className="text-[#FF5B3B]">🏢</span></span>
              : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isPaymentReturn
              ? "Sign in to see your booking details."
              : "Sign in to continue your hobby journey."}
          </p>

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
                  placeholder="Enter your password"
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

            {noAccountEmail ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm rounded-lg px-3 py-2.5 bg-destructive/10"
              >
                <p className="text-destructive">
                  No account found for{" "}
                  <span className="font-semibold break-all">{noAccountEmail}</span>.
                </p>
                <Link
                  to={buildSignupHref(noAccountEmail)}
                  className="inline-flex items-center gap-1 mt-1.5 font-semibold text-primary hover:underline"
                >
                  Create an account <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : (
              error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )
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
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to={buildSignupHref(email || undefined)}
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
