import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Loader2, ArrowLeft, User as UserIcon, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us - Vurlo" },
      { name: "description", content: "Get in touch with Vurlo. We're here to help with your aesthetic lighting and decor questions." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://vurlo.store/contact" },
    ],
  }),
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <ContactContent />
      </div>
      <Footer />
    </main>
  );
}

function ContactContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all the required fields.");
      return;
    }
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit.`);
        return;
      }
    }
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);
      files.forEach((f) => formData.append("files", f));

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });
      let data: any = null;
      try { data = await response.json(); } catch {}
      if (!response.ok) throw new Error(data?.error || "Failed to send message.");
      toast.success("Message sent successfully!", { description: "We'll get back to you within 24 hours.", duration: 3500 });
      setName(""); setEmail(""); setMessage(""); setFiles([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
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
          Contact Us
        </h1>
        <p className="text-sm text-white/45">
          Have questions about our aesthetic lighting, room decor, or your order? Get in touch and we'll reply within
          24 hours.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18] to-[#090910] shadow-[0_4px_30px_rgba(0,0,0,0.4)] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Your Name
              </label>
              <div className="relative focus-glow rounded-xl">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="text"
                  placeholder="e.g., Ayush Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={sending}
                  maxLength={100}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 h-11 pl-10 pr-4 md:text-sm transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative focus-glow rounded-xl">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="e.g., you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 h-11 pl-10 pr-4 md:text-sm transition-all"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Message
              </label>
              <div className="relative focus-glow rounded-xl">
                <MessageSquare className="absolute left-3.5 top-4 h-4 w-4 text-white/30" />
                <Textarea
                  placeholder="How can we help with your setup?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  rows={5}
                  maxLength={5000}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 focus-visible:ring-0 text-white rounded-xl placeholder:text-white/20 pl-10 pr-4 py-3 md:text-sm resize-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Attachments <span className="normal-case text-white/25">(optional · photos/videos · max 3 files · 10MB each)</span>
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={sending}
                onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 3))}
                className="w-full text-sm text-white/40 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-white/[0.06] file:text-white/60 hover:file:bg-white/[0.10] cursor-pointer"
              />
              {files.length > 0 && (
                <p className="text-xs text-white/30">{files.length} file(s) selected: {files.map(f => f.name).join(", ")}</p>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-11 px-8 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
              }}
            >
              {sending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  Sending Message
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
