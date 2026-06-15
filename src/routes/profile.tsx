import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth, DEFAULT_AVATAR } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile Settings - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <ProfileContent />
      </div>
      <Footer />
    </main>
  );
}

function ProfileContent() {
  const { user, profileName, profilePhoto, updateProfileName } = useAuth();
  const [name, setName] = useState(profileName || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileName && profileName !== "User") {
      setName(profileName);
    } else if (profileName === "User" && !name) {
      setName("");  // keep field empty so user is prompted to enter real name
    }
  }, [profileName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a valid display name.");
      return;
    }

    if (trimmedName.length > 50) {
      toast.error("Display name cannot exceed 50 characters.");
      return;
    }

    setSaving(true);
    try {
      await updateProfileName(trimmedName);
      toast.success("Profile updated successfully!", {
        description: "Your display name has been updated.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16 sm:py-24">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center items-center">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      <div className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors duration-200 group mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Collection
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white/90 sm:text-4xl">
          Profile Settings
        </h1>
        <p className="text-sm text-white/45">Update your personal details and account settings.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18] to-[#090910] shadow-[0_4px_30px_rgba(0,0,0,0.4)] p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 pb-6 border-b border-white/[0.06]">
            <img
              src={profilePhoto || DEFAULT_AVATAR}
              alt={profileName || "User"}
              className="w-20 h-20 rounded-full border border-white/10 object-cover shadow-[0_0_20px_rgba(138,46,255,0.15)]"
            />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-sm font-semibold text-white/90">Profile Picture</h3>
              <p className="text-xs text-white/40">
                Avatar synchronized from your account credentials.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Display Name
              </label>
              <div className="relative focus-glow rounded-xl">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="text"
                  placeholder="e.g., Ayush Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 h-11 pl-10 pr-4 text-sm transition-all"
                />
              </div>
            </div>

            {/* Email Address Read-Only */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative rounded-xl">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-white/[0.01] border border-white/[0.04] text-white/40 rounded-xl select-none h-11 pl-10 pr-24 text-sm cursor-not-allowed"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-bold text-white/25 uppercase tracking-wider bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full select-none">
                  <ShieldCheck className="h-2.5 w-2.5 text-violet-400" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-11 px-8 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  Saving Changes
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
