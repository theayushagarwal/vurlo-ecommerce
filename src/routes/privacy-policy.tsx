import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShieldCheck, Lock, Database, Mail, Cookie, UserCheck } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy - Vurlo" },
      { name: "description", content: "Read Vurlo's privacy policy. Learn how we collect, use, and protect your personal data." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://vurlo.store/privacy-policy" },
    ],
  }),
});

function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <PrivacyPolicyContent />
      </div>
      <Footer />
    </main>
  );
}

function PrivacyPolicyContent() {
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
          Data Protection & Privacy
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white/90 mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-white/45 leading-relaxed">
          Your privacy matters to us. This policy explains what information we collect, how we use it, and how we protect it when you shop with Vurlo.
        </p>
        <p className="text-xs text-white/25 mt-3">Last updated: June 2026</p>
      </div>

      {/* Key points banner */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { icon: Lock, label: "No Card Storage", sub: "Handled by Razorpay" },
          { icon: Database, label: "Secure Storage", sub: "Firebase-backed" },
          { icon: UserCheck, label: "Your Control", sub: "Access & deletion" },
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

        <Section title="1. Information We Collect">
          <p className="text-sm text-white/60 leading-relaxed">
            When you create an account, place an order, or contact us, we may collect your <strong className="text-white/80">name, email address, phone number, shipping address, and order history</strong>. We also automatically collect basic device and usage information (such as browser type, pages visited, and approximate location) through standard analytics tools to help us improve the site.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="space-y-2">
            {[
              "To process, pack, and ship your orders",
              "To communicate order updates, delivery status, and respond to support requests",
              "To send occasional offers or product updates (you can opt out anytime)",
              "To detect and prevent fraudulent transactions",
              "To improve our website, products, and overall shopping experience",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-violet-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Third-Party Sharing" highlight>
          <p className="text-sm text-white/60 leading-relaxed mb-3">
            We share only the information necessary with trusted third parties to operate our store:
          </p>
          <ul className="space-y-2 mb-3">
            {[
              "Firebase (Google) — for secure account authentication and data storage",
              "Razorpay — for processing payments securely",
              "Shipping & logistics partners — to deliver your orders to you",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-violet-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-white/60 leading-relaxed">
            We <strong className="text-white/80">do not sell, rent, or trade</strong> your personal information to any third party for marketing purposes.
          </p>
        </Section>

        <Section title="4. Payment Information">
          <p className="text-sm text-white/60 leading-relaxed">
            Vurlo does <strong className="text-white/80">not store your card, UPI, or banking details</strong> on our servers at any point. All payments are processed directly through Razorpay, a PCI-DSS compliant payment gateway. Please refer to Razorpay's own privacy policy for details on how they handle your payment data.
          </p>
        </Section>

        <Section title="5. Cookies & Tracking">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <Cookie className="h-4 w-4 text-violet-400" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              We use cookies and similar technologies to keep you logged in, remember your cart and wishlist, and understand how visitors use our site. You can disable cookies in your browser settings, though some features (like cart persistence) may not work correctly without them.
            </p>
          </div>
        </Section>

        <Section title="6. Data Security">
          <p className="text-sm text-white/60 leading-relaxed">
            We use industry-standard security measures, including encrypted data storage and secure authentication via Firebase, to protect your information. However, no method of transmission or storage over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p className="text-sm text-white/60 leading-relaxed">
            You have the right to access, update, or request deletion of your personal data at any time. To make such a request, please contact us through our support page — we will respond within a reasonable timeframe.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p className="text-sm text-white/60 leading-relaxed">
            Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can remove it.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p className="text-sm text-white/60 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. The "Last updated" date at the top of this page will reflect the most recent revision. Continued use of our site after changes means you accept the updated policy.
          </p>
        </Section>

      </div>

      {/* CTA */}
      <div className="mt-12 border border-violet-500/15 bg-violet-500/[0.04] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/80 mb-1">Questions about your data?</p>
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
