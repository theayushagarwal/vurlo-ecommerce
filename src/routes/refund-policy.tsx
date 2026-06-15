import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShieldCheck, Video, Clock, PackageX, CheckCircle2, XCircle, AlertTriangle, Mail } from "lucide-react";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
  head: () => ({
    meta: [
      { title: "Return & Refund Policy - Vurlo" },
      { name: "description", content: "Review Vurlo's Return and Refund Policy. Learn about eligibility, unboxing video requirements, and refund timelines." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://vurlo.store/refund-policy" },
    ],
  }),
});

function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <RefundPolicyContent />
      </div>
      <Footer />
    </main>
  );
}

function RefundPolicyContent() {
  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors duration-200 group mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Collection
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          Customer Protection Policy
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white/90 mb-3">
          Return & Refund Policy
        </h1>
        <p className="text-sm text-white/45 leading-relaxed">
          We stand behind every product we ship. This policy is designed to protect you against genuine product damage while keeping our process fair and transparent.
        </p>
        <p className="text-xs text-white/25 mt-3">Last updated: June 2026</p>
      </div>

      {/* Key conditions banner */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { icon: Video, label: "Unboxing Video", sub: "Required proof" },
          { icon: Clock, label: "48-Hour Window", sub: "From delivery" },
          { icon: PackageX, label: "Damage Only", sub: "Eligible reason" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-1.5 border border-white/[0.06] bg-white/[0.02] rounded-2xl p-4 text-center"
          >
            <Icon className="h-5 w-5 text-violet-400" />
            <p className="text-xs font-bold text-white/80">{label}</p>
            <p className="text-[10px] text-white/35">{sub}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-8">

        {/* Section 1 */}
        <Section title="1. Return Eligibility">
          <p className="text-sm text-white/60 leading-relaxed">
            Returns are accepted <strong className="text-white/80">only if the product arrives physically damaged</strong>. We do not accept returns for change of mind, incorrect size expectations, colour variation from screen display, or buyer's remorse.
          </p>
          <p className="text-sm text-white/60 leading-relaxed mt-3">
            All our products are quality-checked before dispatch. If your item arrives damaged, we will make it right — no questions asked.
          </p>
        </Section>

        {/* Section 2 — most important */}
        <Section title="2. Unboxing Video Requirement" highlight>
          <div className="flex gap-3 mb-4">
            <div className="mt-0.5 shrink-0">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-400/80 leading-relaxed font-medium">
              A complete, uncut unboxing video is mandatory for all return and refund claims. Claims submitted without a valid unboxing video will not be processed under any circumstances.
            </p>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-3">Your unboxing video must:</p>
          <ul className="space-y-2">
            {[
              "Begin before the outer packaging is opened — the sealed package must be visible at the start",
              "Show the package label / delivery sticker clearly",
              "Be a single continuous recording with no cuts or pauses",
              "Clearly show the damage at the moment of unboxing",
              "Be recorded within 48 hours of delivery confirmation",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/35 mt-4 border-t border-white/[0.06] pt-4">
            Videos edited, trimmed, or starting after the package has already been opened will not be accepted as valid proof.
          </p>
        </Section>

        {/* Section 3 */}
        <Section title="3. Return Window">
          <p className="text-sm text-white/60 leading-relaxed">
            You must raise a return request within <strong className="text-white/80">48 hours of delivery</strong>. The delivery timestamp recorded by our courier partner is used as the reference time.
          </p>
          <p className="text-sm text-white/60 leading-relaxed mt-3">
            Requests raised after 48 hours of delivery will not be eligible for return or refund, regardless of the reason.
          </p>
        </Section>

        {/* Section 4 */}
        <Section title="4. What Is Not Covered">
          <ul className="space-y-2">
            {[
              "Minor scratches or marks caused after delivery",
              "Damage due to improper use or installation",
              "Products with tampered or missing original packaging",
              "Change of mind or accidental orders",
              "Colour or lighting variation due to screen settings",
              "Claims raised after 48 hours of delivery",
              "Claims without a valid unboxing video",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/60">
                <XCircle className="h-4 w-4 text-red-400/70 shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </Section>

        {/* Section 5 */}
        <Section title="5. How to Raise a Return Request">
          <ol className="space-y-4">
            {[
              {
                step: "01",
                title: "Contact Support",
                desc: 'Email us at support@vurlo.store with subject line "Return Request — Order #[your order ID]" within 48 hours of delivery.',
              },
              {
                step: "02",
                title: "Attach Your Unboxing Video",
                desc: "Include the complete, uncut unboxing video as an attachment or shareable link (Google Drive, WeTransfer). Make sure the video is accessible.",
              },
              {
                step: "03",
                title: "Wait for Review",
                desc: "Our team will review your claim within 2–3 business days and respond with next steps.",
              },
              {
                step: "04",
                title: "Resolution",
                desc: "Approved claims will receive either a replacement product or a full refund, at our discretion based on stock availability.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <span className="text-[10px] font-black text-violet-400/60 font-mono mt-1 w-6 shrink-0">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">{title}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Section 6 */}
        <Section title="6. Refund Timeline">
          <p className="text-sm text-white/60 leading-relaxed">
            Once a return or refund is approved, please allow <strong className="text-white/80">5–7 business days</strong> for the refund to reflect in your original payment method. For COD orders, refunds will be processed via bank transfer — please provide your bank details when raising the claim.
          </p>
        </Section>

        {/* Section 7 */}
        <Section title="7. Non-Returnable Items">
          <p className="text-sm text-white/60 leading-relaxed">
            Certain product categories including consumables, items sold during clearance sales, and bundled accessories sold separately are non-returnable. This will be clearly indicated on the product page at the time of purchase.
          </p>
        </Section>

      </div>

      {/* CTA */}
      <div className="mt-12 border border-violet-500/15 bg-violet-500/[0.04] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/80 mb-1">Still have questions?</p>
          <p className="text-xs text-white/40">Our support team typically responds within 24 hours.</p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(124,58,237,0.2)] shrink-0"
        >
          <Mail className="h-3.5 w-3.5" />
          Contact Support
        </Link>
      </div>

    </div>
  );
}

function Section({
  title,
  children,
  highlight = false,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-yellow-500/15 bg-yellow-500/[0.03]"
          : "border-white/[0.06] bg-white/[0.01]"
      }`}
    >
      <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </div>
  );
}
