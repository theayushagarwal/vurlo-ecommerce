import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Scale, AlertTriangle, Mail, Truck, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
  head: () => ({
    meta: [
      { title: "Terms of Service - Vurlo" },
      { name: "description", content: "Review the terms and conditions for shopping and using Vurlo." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://vurlo.store/terms-of-service" },
    ],
  }),
});

function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <TermsOfServiceContent />
      </div>
      <Footer />
    </main>
  );
}

function TermsOfServiceContent() {
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
          <Scale className="h-3.5 w-3.5" />
          Legal Agreement
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white/90 mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-white/45 leading-relaxed">
          By using Vurlo, you agree to the following terms. Please read them carefully before placing an order.
        </p>
        <p className="text-xs text-white/25 mt-3">Last updated: June 2026</p>
      </div>

      {/* Sections */}
      <div className="space-y-8">

        <Section title="1. Acceptance of Terms">
          <p className="text-sm text-white/60 leading-relaxed">
            By accessing or using the Vurlo website, creating an account, or placing an order, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our website.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p className="text-sm text-white/60 leading-relaxed">
            You must be at least 18 years old to place an order on Vurlo. If you are under 18, you may use this site only with the involvement and consent of a parent or guardian.
          </p>
        </Section>

        <Section title="3. Products & Pricing">
          <p className="text-sm text-white/60 leading-relaxed">
            All product descriptions, images, and prices are subject to change without prior notice. We make every effort to display product colors and finishes accurately, but actual colors may vary slightly depending on your screen settings — this is especially relevant for RGB lighting products, where on-screen color rendering may differ from the actual product output.
          </p>
        </Section>

        <Section title="4. Orders & Payment" highlight>
          <div className="flex gap-3 mb-3">
            <div className="mt-0.5 shrink-0">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-400/80 leading-relaxed font-medium">
              An order is confirmed only after successful payment via Razorpay. Vurlo reserves the right to cancel or refuse any order due to stock unavailability, pricing errors, or suspected fraud — in which case a full refund will be issued.
            </p>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            All payments are processed securely through Razorpay. Vurlo does not have access to, and does not store, your card or banking details.
          </p>
        </Section>

        <Section title="5. Shipping & Delivery">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <Truck className="h-4 w-4 text-violet-400" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Delivery timelines shown at checkout are estimates only and are not guaranteed. Delays caused by courier or logistics partners are outside Vurlo's control, though we will assist in tracking and resolving any delivery issues. For return and refund terms, please see our{" "}
              <Link to="/refund-policy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Refund Policy
              </Link>.
            </p>
          </div>
        </Section>

        <Section title="6. Sourcing & Fulfillment Disclosure">
          <p className="text-sm text-white/60 leading-relaxed">
            Vurlo sources products through third-party suppliers and manufacturers. Wherever possible, products are quality-checked before dispatch. Minor variations in packaging, branding, or accessories included by the original manufacturer may occur and do not constitute a defect.
          </p>
        </Section>

        <Section title="7. Limitation of Liability" highlight>
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <ShieldAlert className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-400/80 leading-relaxed font-medium">
              Vurlo is not liable for any indirect, incidental, or consequential damages arising from the use, misuse, or installation of any product purchased from us — including electrical or lighting products. Please install and use all products strictly according to the included instructions and ensure compatibility with your power source. Improper use or unauthorized modification voids any applicable warranty.
            </p>
          </div>
        </Section>

        <Section title="8. Intellectual Property">
          <p className="text-sm text-white/60 leading-relaxed">
            All content on this website — including the Vurlo name, logo, branding, graphics, and page design — is the property of Vurlo and may not be copied, reproduced, or used without prior written permission.
          </p>
        </Section>

        <Section title="9. Governing Law">
          <p className="text-sm text-white/60 leading-relaxed">
            These Terms of Service are governed by the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts of{" "}
            <strong className="text-white/80">New Delhi, Delhi</strong>, India.
          </p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p className="text-sm text-white/60 leading-relaxed">
            We may revise these Terms of Service from time to time. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the site after changes are posted constitutes your acceptance of the revised terms.
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
