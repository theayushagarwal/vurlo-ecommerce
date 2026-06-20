import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Loader2, ArrowLeft, Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ResetPasswordSearch {
  oobCode?: string;
  mode?: string;
}

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    return {
      oobCode: search.oobCode as string | undefined,
      mode: search.mode as string | undefined,
    };
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <ResetPasswordContent />
      </div>
      <Footer />
    </main>
  );
}

function ResetPasswordContent() {
  const { oobCode } = Route.useSearch();
  const { setAuthModalOpen } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oobCode) {
      setError("Reset code is missing. Please request a new password reset link.");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success("Password reset successful!", {
        description: "You can now log in with your new password.",
        duration: 4000,
      });
    } catch (err: unknown) {
      console.error("[Password Reset Error]:", err);
      const errorObj = err as { code?: string; message?: string };
      if (errorObj.code === "auth/invalid-action-code") {
        setError("The password reset link has expired or has already been used.");
      } else if (errorObj.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(errorObj.message || "Failed to reset password. Please try again.");
      }
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md px-6 py-16 sm:py-24">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center items-center">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors duration-200 group mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Collection
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 sm:text-3xl">
          Account Recovery
        </h1>
        <p className="text-xs text-white/45 mt-1">
          Set a new, secure password for your VURLO account
        </p>
      </div>

      {!oobCode ? (
        <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80">Invalid Action Link</h3>
            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
              This link is invalid, expired, or has already been used. Please request another
              password reset email.
            </p>
          </div>
          <Link
            to="/"
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 px-5 py-2 text-xs font-semibold text-white/80 hover:text-white transition duration-200"
          >
            Request New Link
          </Link>
        </div>
      ) : success ? (
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80">Password Reset Completed</h3>
            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
              Your password has been successfully updated. You can now access your VURLO account
              using your new credentials.
            </p>
          </div>
          <button
            onClick={() => {
              setAuthModalOpen(true);
            }}
            className="w-full text-xs font-bold uppercase tracking-wider h-10 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Access Account
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18] to-[#090910] shadow-[0_4px_30px_rgba(0,0,0,0.4)] p-8">
          <form
            key={error}
            onSubmit={handleSubmit}
            className={`space-y-5 ${error ? "animate-shake" : ""}`}
          >
            {error && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-start gap-2">
                <span className="mt-0.5 select-none text-[10px]">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  New Password
                </label>
                <div className="relative focus-glow rounded-xl">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 h-11 pl-10 pr-3.5 md:text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  Confirm Password
                </label>
                <div className="relative focus-glow rounded-xl">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 h-11 pl-10 pr-3.5 md:text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-xs font-bold uppercase tracking-wider h-11 mt-6 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
