import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { checkIsAdmin } from "@/lib/admin-auth";
import { type User } from "firebase/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // If already logged in, verify admin status and redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      setCheckingRedirect(true);
      checkIsAdmin(user.uid, user.email).then((isAdmin) => {
        if (isAdmin) {
          navigate({ to: "/admin/dashboard" });
        } else {
          setCheckingRedirect(false);
        }
      });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || checkingRedirect) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          <p className="text-sm font-medium tracking-wide text-white/50 animate-pulse">
            Authenticating Admin...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Brute-force protection
    if (lockedUntil && Date.now() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast.error("Too many failed attempts", {
        description: `Please wait ${secondsLeft} seconds before trying again.`,
      });
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoggingIn(true);
    try {
      // 1. Authenticate with Firebase
      await login(trimmedEmail, trimmedPassword);

      // Resolve the current user session cleanly via onAuthStateChanged
      const currentUser = await new Promise<User | null>((resolve) => {
        import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
          const currentAuth = getAuth();
          if (currentAuth.currentUser) {
            resolve(currentAuth.currentUser);
            return;
          }
          const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
            if (user) {
              unsubscribe();
              resolve(user);
            }
          });
          setTimeout(() => {
            unsubscribe();
            resolve(currentAuth.currentUser);
          }, 3000);
        });
      });

      if (!currentUser) {
        throw new Error("Unable to retrieve user session. Please try again.");
      }

      // 2. Perform admin authorization check
      const authorized = await checkIsAdmin(currentUser.uid, currentUser.email);

      if (!authorized) {
        toast.error("Access Denied", {
          description: "This email address is not authorized for admin access.",
        });
        await logout();
        setLoggingIn(false);
        return;
      }

      toast.success("Welcome, Admin!", {
        description: "Access granted to Vurlo management console.",
        duration: 3000,
      });

      navigate({ to: "/admin/dashboard" });
    } catch (error: unknown) {
      console.error("[Admin Login] Login failed:", error);
      const firebaseError = error as { code?: string; message?: string };
      let message = "Invalid email or password.";
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        message = "Invalid email or password.";
      } else if (firebaseError.message) {
        message = firebaseError.message;
      }
      toast.error("Authentication Failed", {
        description: message,
      });
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        const lockDuration = 60 * 1000; // 60 seconds
        setLockedUntil(Date.now() + lockDuration);
        setFailedAttempts(0);
        toast.error("Account temporarily locked", {
          description: "Too many failed attempts. Please wait 60 seconds.",
        });
      }
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030307] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-violet-600/[0.05] blur-[130px]" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/[0.03] blur-[110px]" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-300">
              Vurlo Admin Portal
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white leading-none">
            System Administration
          </h1>
          <p className="text-xs text-white/40 max-w-xs mx-auto">
            Authorized console. Sign in using your administrator credentials.
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18]/60 to-[#090910]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-violet-400" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@vurlo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loggingIn || authLoading}
                className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-11 px-4 md:text-sm focus:bg-white/[0.04]"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-violet-400" />
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loggingIn || authLoading}
                className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-11 px-4 md:text-sm focus:bg-white/[0.04]"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loggingIn || authLoading || (lockedUntil !== null && Date.now() < lockedUntil)}
              className="w-full text-xs font-bold uppercase tracking-wider h-11 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_25px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2 mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
              }}
            >
              {loggingIn || authLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  Verifying Credentials
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Security Warning */}
        <div className="flex items-center gap-2 justify-center text-[10px] text-white/30 border border-white/[0.03] bg-white/[0.01] rounded-xl py-3 px-4">
          <ShieldAlert className="h-3.5 w-3.5 text-white/20 shrink-0" />
          <span>Authorized administrator access only.</span>
        </div>
      </div>
    </div>
  );
}
