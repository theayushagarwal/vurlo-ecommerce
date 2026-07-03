import { Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { Bell, BellOff, Package, AlertCircle, Info, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import React from "react";

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return "Just now";
  let date: Date;
  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getNotificationIcon = (type: "order" | "system" | "alert") => {
  switch (type) {
    case "order":
      return Package;
    case "alert":
      return AlertCircle;
    case "system":
    default:
      return Info;
  }
};

const getNotificationIconStyles = (type: "order" | "system" | "alert") => {
  switch (type) {
    case "order":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "alert":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "system":
    default:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
    }
    if (n.link) {
      navigate({ to: n.link });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between page-transition">
      <div>
        <Navbar />

        <section className="relative mx-auto max-w-4xl px-6 py-24 sm:px-8">
          {/* Ambient background glows */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
            <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
          </div>

          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
                <Bell className="h-3 w-3 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                  Stay Updated
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Notifications
              </h1>
              <p className="text-xs text-white/45">
                Review updates on your pending orders, delivery states, and security logs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {user && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider h-10 px-5 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.2)]"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/45 hover:text-white transition-colors duration-200 h-10 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl px-5"
              >
                <ArrowLeft size={14} />
                Back to Shop
              </Link>
            </div>
          </div>

          {!user ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl max-w-md mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm animate-in fade-in duration-300">
              <div className="relative w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/40 shadow-[0_0_30px_rgba(138,46,255,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 rounded-full blur-md" />
                <Bell className="h-6 w-6 text-violet-400 relative z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">Login to view notifications</p>
                <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed mx-auto">
                  Please authenticate your session to synchronize order notifications and alerts.
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl max-w-md mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm animate-in fade-in duration-300">
              <div className="relative w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/40 shadow-[0_0_30px_rgba(138,46,255,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 rounded-full blur-md" />
                <BellOff className="h-6 w-6 text-violet-400 relative z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">No notifications yet</p>
                <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed mx-auto">
                  We'll update you when order transactions or security events occur on your account.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0d0d16]/60 to-[#070710]/80 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {notifications.map((n) => {
                const IconComponent = getNotificationIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ease-out cursor-pointer hover:scale-[1.005] ${
                      n.read
                        ? "bg-transparent border-transparent border-l-2 border-l-transparent hover:bg-white/[0.02] hover:border-white/[0.04] hover:shadow-[0_4px_12px_rgba(255,255,255,0.01)]"
                        : "bg-violet-500/[0.03] border-white/[0.04] border-l-2 border-l-violet-500 hover:bg-violet-500/[0.05] hover:border-white/[0.06] hover:shadow-[0_4px_15px_rgba(139,92,246,0.04)]"
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${getNotificationIconStyles(
                        n.type
                      )}`}
                    >
                      <IconComponent size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-relaxed ${
                          n.read ? "text-white/60" : "text-white/95 font-medium"
                        }`}
                      >
                        {n.message}
                      </p>
                      <span className="text-[10px] text-white/30 block mt-1.5">
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0 self-center shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
