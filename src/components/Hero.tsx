import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useHeroParallax, useMagnetic, useScrollReveal } from "@/hooks/use-premium-interactions";

export function Hero() {
  const isLowEnd = typeof navigator !== 'undefined' && (
    navigator.hardwareConcurrency <= 4 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const hero = useHeroParallax<HTMLElement>();
  const primaryCta = useMagnetic<HTMLAnchorElement>({ strength: 7, scale: 1.045 });
  const secondaryCta = useMagnetic<HTMLAnchorElement>({ strength: 5, scale: 1.025 });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Typewriter for "Upgrade Your Vibe."
  const VIBE_TEXT = "Upgrade Your Vibe.";
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    const delay = 900; // start after 900ms
    const speed = 52; // ms per character
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTyped(VIBE_TEXT.slice(0, i));
        if (i >= VIBE_TEXT.length) {
          clearInterval(interval);
          // blink cursor 4 times then hide
          let blinks = 0;
          const blink = setInterval(() => {
            setShowCursor(v => !v);
            blinks++;
            if (blinks >= 6) { clearInterval(blink); setShowCursor(false); }
          }, 350);
        }
      }, speed);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useScrollReveal(headingRef, 0);
  useScrollReveal(subtextRef, 150);
  useScrollReveal(ctasRef, 300);
  useScrollReveal(statsRef, 450);

  return (
    <section
      ref={hero.ref}
      className="relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a1f] to-[#050507]"
      onPointerMove={hero.onPointerMove}
      onPointerLeave={hero.onPointerLeave}
    >
      {/* Grain texture overlay */}
      <div className="hero-grain absolute inset-0 z-[15] pointer-events-none" />

      {/* Ambient glows */}
      <div className="hero-ambient-primary absolute top-1/2 left-1/2 w-[800px] max-w-full h-[800px] bg-purple-600 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-ambient-secondary absolute top-1/3 left-2/3 w-[500px] max-w-full h-[500px] bg-cyan-500 blur-[120px] rounded-full" />
      <div className="hero-ambient-tertiary absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-cyan-400 blur-[120px] rounded-full" />

      {/* Grid */}
      <div
        className="hero-grid-parallax absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floating particles */}
      <div className="hero-particle hero-particle-1 absolute w-1.5 h-1.5 rounded-full bg-violet-400/80 blur-[1px] z-10" style={{ top: "22%", left: "12%" }} />
      <div className="hero-particle hero-particle-2 absolute w-1.5 h-1.5 rounded-full bg-cyan-400/70 blur-[1px] z-10" style={{ top: "58%", left: "42%" }} />
      {!isLowEnd && (
        <>
          <div className="hero-particle hero-particle-3 absolute w-2 h-2 rounded-full bg-indigo-400/60 blur-[1px] z-10" style={{ top: "30%", right: "8%" }} />
          <div className="hero-particle hero-particle-4 absolute w-1 h-1 rounded-full bg-violet-300/60 blur-[1px] z-10" style={{ top: "75%", left: "25%" }} />
        </>
      )}
      <div className="hero-particle hero-particle-5 absolute w-1.5 h-1.5 rounded-full bg-cyan-300/50 blur-[1px] z-10" style={{ top: "15%", right: "30%" }} />

      {/* ── Main grid ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-8 md:px-20 pt-4 pb-6 md:pt-20 md:pb-24 grid grid-cols-2 gap-3 md:gap-8 lg:gap-16 items-center">

        {/* ── Left: Text content ── */}
        <div className="space-y-6 md:space-y-10">

          {/* Badge */}
          <div className="hidden md:inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs tracking-widest text-white/70 uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            New Collection &middot; 2026
          </div>

          {/* H1 */}
          <h1
            ref={headingRef}
            className="font-display leading-[1.05] tracking-tight hero-heading"
            style={{ fontSize: "clamp(1.1rem, 4.5vw, 6rem)", fontWeight: 800 }}
          >
            <span className="sr-only">Vurlo - Premium Lighting & Decor</span>
            <span className="block text-white/90">Upgrade Your Room.</span>
            <span
              className="block hero-gradient-text"
              style={{
                background: "linear-gradient(110deg, #a78bfa 0%, #6366f1 50%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {typed}
              {showCursor && (
                <span style={{ WebkitTextFillColor: "#a78bfa", opacity: 1, display: "inline" }}>|</span>
              )}
            </span>
          </h1>

          {/* Subtext */}
          <p
            ref={subtextRef}
            className="text-xs leading-relaxed text-white/60 max-w-sm font-light tracking-wide md:text-sm md:text-lg md:max-w-md"
          >
            Lights and decor that actually make your room look good. Built for setups, bedrooms, and anyone tired of boring spaces.
          </p>

          {/* CTAs */}
          <div ref={ctasRef} className="flex flex-wrap items-center gap-3 md:gap-4">
            <a
              ref={primaryCta.ref}
              href="/shop"
              className="premium-hero-cta group relative inline-flex items-center gap-2.5 rounded-full px-3 py-2 sm:px-9 sm:py-4 text-[11px] md:text-sm font-semibold text-white overflow-hidden transition-all duration-500"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 10px 40px rgba(109,40,217,0.5)",
              }}
              onPointerMove={primaryCta.onPointerMove}
              onPointerLeave={primaryCta.onPointerLeave}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_70%)]" />
              <span className="relative">Shop Now</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              ref={secondaryCta.ref}
              href="/#categories"
              className="premium-text-link text-xs text-white/50 hover:text-white transition"
              onPointerMove={secondaryCta.onPointerMove}
              onPointerLeave={secondaryCta.onPointerLeave}
            >
              Explore Lighting &gt;
            </a>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="flex gap-4 pt-3 border-t border-white/[0.08] md:gap-12 md:pt-6"
          >
            {[
              ["4.9★", "Avg Rating"],
              ["48hr", "Dispatch"],
              ["Free", "Shipping"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-xl font-semibold text-white/90 md:text-2xl">{n}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest md:text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Hero image ── */}
        <div className="hero-img-wrapper relative flex justify-center items-center min-w-0">

          {/* Rotating border ring */}
          <div className="hero-orbit-ring absolute inset-0 rounded-2xl z-0" />

          {/* Corner accent sparks */}
          <div className="hero-spark hero-spark-tl absolute top-[-6px] left-[-6px] w-3 h-3 rounded-full bg-violet-400 z-20" />
          <div className="hero-spark hero-spark-tr absolute top-[-6px] right-[-6px] w-2 h-2 rounded-full bg-cyan-400 z-20" />
          <div className="hero-spark hero-spark-br absolute bottom-[10px] right-[-6px] w-3 h-3 rounded-full bg-indigo-400 z-20" />
          <div className="hero-spark hero-spark-bl absolute bottom-[10px] left-[-6px] w-2 h-2 rounded-full bg-violet-300 z-20" />

          {/* Glow behind image */}
          <div className="hero-product-glow absolute w-[75%] h-[75%] bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 opacity-60 blur-[100px] rounded-full z-0" />

          {/* Antigravity dust particles */}
          <div className="antigrav-particle antigrav-1 absolute z-30 w-1 h-1 rounded-full bg-violet-300/90" />
          <div className="antigrav-particle antigrav-2 absolute z-30 w-[3px] h-[3px] rounded-full bg-cyan-300/80" />
          <div className="antigrav-particle antigrav-3 absolute z-30 w-[2px] h-[2px] rounded-full bg-white/60" />
          <div className="antigrav-particle antigrav-4 absolute z-30 w-1 h-1 rounded-full bg-indigo-300/70" />
          {!isLowEnd && (
            <>
              <div className="antigrav-particle antigrav-5 absolute z-30 w-[3px] h-[3px] rounded-full bg-violet-200/60" />
              <div className="antigrav-particle antigrav-6 absolute z-30 w-[2px] h-[2px] rounded-full bg-cyan-200/70" />
              <div className="antigrav-particle antigrav-7 absolute z-30 w-1 h-1 rounded-full bg-purple-300/50" />
              <div className="antigrav-particle antigrav-8 absolute z-30 w-[2px] h-[2px] rounded-full bg-white/40" />
            </>
          )}

          {/* Image frame — perspective container */}
          <div className="hero-img-frame relative z-10">
            {/* Scanline sweep */}
            <div className="hero-scanline-wrap absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
              <div className="hero-scanline" />
            </div>

            {/* Colour tint vignette */}
            <div className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(109,40,217,0.18) 0%, transparent 70%)" }}
            />

            <img
              src="/aura-rgb-1.webp"
              alt="Vurlo RGB Ambience Setup"
              className="hero-product-premium"
              style={{
                filter: "drop-shadow(0 40px 80px rgba(109,40,217,0.55)) drop-shadow(0 20px 40px rgba(0,0,0,0.8))",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        /* ── Grain texture ── */
        .hero-grain {
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.015) 1px,
            rgba(255,255,255,0.015) 2px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.01) 1px,
            rgba(255,255,255,0.01) 2px
          );
          background-size: 3px 3px;
          opacity: 1;
        }

        /* ── Grid parallax ── */
        .hero-grid-parallax {
          transform: translate3d(var(--hero-grid-x, 0px), var(--hero-grid-y, 0px), 0);
          transition: transform 0.16s ease-out;
          will-change: transform;
        }

        /* ── Ambient glows ── */
        .hero-ambient-primary {
          transform: translate3d(calc(-50% + var(--hero-glow-x, 0px)), calc(-50% + var(--hero-glow-y, 0px)), 0);
          opacity: 0.18;
          animation: heroGlow1 22s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .hero-ambient-secondary {
          transform: translate3d(calc(var(--hero-glow-x, 0px) * -0.45), calc(var(--hero-glow-y, 0px) * -0.35), 0);
          opacity: 0.10;
          animation: heroGlow2 30s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .hero-ambient-tertiary {
          opacity: 0.07;
          animation: heroGlow2 25s ease-in-out infinite reverse;
        }

        /* ── Orbiting border ring ── */
        .hero-orbit-ring {
          border: 1px solid transparent;
          border-radius: 20px;
          background: transparent padding-box,
            conic-gradient(from var(--ring-angle, 0deg), transparent 0deg, rgba(167,139,250,0.6) 60deg, rgba(34,211,238,0.5) 120deg, rgba(99,102,241,0.6) 180deg, transparent 240deg) border-box;
          animation: ringRotate 6s linear infinite;
          pointer-events: none;
        }
        @property --ring-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ringRotate {
          to { --ring-angle: 360deg; }
        }

        /* ── Corner sparks ── */
        .hero-spark {
          animation: sparkPulse 2.5s ease-in-out infinite;
          box-shadow: 0 0 8px 2px currentColor;
        }
        .hero-spark-tl { animation-delay: 0s; }
        .hero-spark-tr { animation-delay: 0.6s; }
        .hero-spark-br { animation-delay: 1.2s; }
        .hero-spark-bl { animation-delay: 1.8s; }
        @keyframes sparkPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }

        /* ── Scanline ── */
        .hero-scanline {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.7) 30%, rgba(34,211,238,0.5) 70%, transparent 100%);
          animation: scanlineMove 4s ease-in-out infinite;
          top: 0;
        }
        @keyframes scanlineMove {
          0% { top: -4px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.6; }
          100% { top: 105%; opacity: 0; }
        }

        /* ── Image wrapper — FIXED: aspect-ratio based, no fixed height ── */
        .hero-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          align-self: center;
          min-width: 0;
          max-width: 100%;
          overflow: visible;
        }

        /* ── Image frame — FIXED: fills wrapper, clip overflow ── */
        .hero-img-frame {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          overflow: hidden;
          animation: antigravFloat 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        @media (min-width: 768px) {
          .hero-img-frame {
            animation: antigravFloat3D 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .hero-img-frame:hover {
            animation: none !important;
            transform: perspective(1200px) rotateY(-2deg) rotateX(1deg) translateY(-8px) !important;
          }
        }

        /* ── Product image — FIXED: contain inside frame, no overflow ── */
        .hero-product-premium {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          border-radius: 0;
          transform-origin: center center;
          animation: none;
          will-change: transform;
          transition: filter 0.4s ease;
        }

        /* ── Antigravity float keyframes ── */
        @keyframes antigravFloat {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        @keyframes antigravFloat3D {
          0%   { transform: translateY(0px); }
          25%  { transform: translateY(-3px); }
          50%  { transform: translateY(-6px); }
          75%  { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }

        /* ── Antigravity dust particles ── */
        .antigrav-particle {
          pointer-events: none;
          will-change: transform, opacity;
          box-shadow: 0 0 4px 1px currentColor;
        }
        .antigrav-1 { bottom: 25%; left: 8%; animation: antigravDust1 5.5s ease-in-out infinite; }
        .antigrav-2 { bottom: 35%; right: 10%; animation: antigravDust2 7s ease-in-out infinite; animation-delay: -1.5s; }
        .antigrav-3 { bottom: 20%; left: 22%; animation: antigravDust3 6.2s ease-in-out infinite; animation-delay: -0.8s; }
        .antigrav-4 { bottom: 40%; right: 20%; animation: antigravDust1 8s ease-in-out infinite; animation-delay: -3s; }
        .antigrav-5 { bottom: 15%; left: 50%; animation: antigravDust2 5s ease-in-out infinite; animation-delay: -2s; }
        .antigrav-6 { bottom: 30%; right: 5%; animation: antigravDust3 9s ease-in-out infinite; animation-delay: -4s; }
        .antigrav-7 { bottom: 10%; left: 35%; animation: antigravDust1 6.8s ease-in-out infinite; animation-delay: -1s; }
        .antigrav-8 { bottom: 45%; left: 15%; animation: antigravDust2 7.5s ease-in-out infinite; animation-delay: -5s; }

        @keyframes antigravDust1 {
          0%   { transform: translate(0px, 0px); opacity: 0; }
          10%  { opacity: 0.9; }
          50%  { transform: translate(8px, -40px); opacity: 0.7; }
          90%  { opacity: 0; }
          100% { transform: translate(-4px, -80px); opacity: 0; }
        }
        @keyframes antigravDust2 {
          0%   { transform: translate(0px, 0px); opacity: 0; }
          10%  { opacity: 0.8; }
          50%  { transform: translate(-10px, -35px); opacity: 0.6; }
          90%  { opacity: 0; }
          100% { transform: translate(6px, -70px); opacity: 0; }
        }
        @keyframes antigravDust3 {
          0%   { transform: translate(0px, 0px); opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translate(5px, -50px); opacity: 0.5; }
          90%  { opacity: 0; }
          100% { transform: translate(-8px, -90px); opacity: 0; }
        }

        /* ── Glow parallax ── */
        .hero-product-glow {
          transform: translate3d(calc(var(--hero-glow-x, 0px) * -0.45), calc(var(--hero-glow-y, 0px) * -0.35), 0);
          transition: transform 0.18s ease-out;
          will-change: transform;
        }

        /* ── Floating particles ── */
        .hero-particle-1 { animation: particleDrift1 7s ease-in-out infinite; }
        .hero-particle-2 { animation: particleDrift2 9s ease-in-out infinite; }
        .hero-particle-3 { animation: particleDrift3 6s ease-in-out infinite; }
        .hero-particle-4 { animation: particleDrift1 11s ease-in-out infinite reverse; }
        .hero-particle-5 { animation: particleDrift2 8s ease-in-out infinite reverse; }
        @keyframes particleDrift1 {
          0%, 100% { transform: translate(0, 0); opacity: 0.7; }
          50% { transform: translate(10px, -16px); opacity: 1; }
        }
        @keyframes particleDrift2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(-12px, 12px); opacity: 0.9; }
        }
        @keyframes particleDrift3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(8px, -10px); opacity: 1; }
        }

        /* ── Keyframes ── */
        @keyframes heroGlow1 {
          0%, 100% {
            transform: translate3d(calc(-50% + var(--hero-glow-x, 0px)), calc(-50% + var(--hero-glow-y, 0px)), 0) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(calc(-50% + var(--hero-glow-x, 0px) + 12px), calc(-50% + var(--hero-glow-y, 0px) - 9px), 0) scale(1.03);
            opacity: 0.20;
          }
        }
        @keyframes heroGlow2 {
          0%, 100% {
            transform: translate3d(calc(var(--hero-glow-x, 0px) * -0.45), calc(var(--hero-glow-y, 0px) * -0.35), 0) scale(1);
            opacity: 0.08;
          }
          50% {
            transform: translate3d(calc(var(--hero-glow-x, 0px) * -0.45 - 9px), calc(var(--hero-glow-y, 0px) * -0.35 + 12px), 0) scale(0.96);
            opacity: 0.12;
          }
        }

        /* ── CTA ── */
        .premium-hero-cta,
        .premium-text-link {
          will-change: transform;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-hero-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            0 0 0 1px rgba(139,92,246,0.34),
            0 10px 36px rgba(109,40,217,0.48),
            0 0 30px rgba(34,211,238,0.18) !important;
        }

        /* ── Mobile — FIXED ── */
        @media (max-width: 767px) {
          .hero-img-wrapper {
            aspect-ratio: 4 / 3;
            width: 100%;
            max-height: 240px;
          }
          .hero-img-frame {
            border-radius: 14px;
            inset: 0;
          }
          .hero-product-premium {
            animation: antigravFloat 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite !important;
            border-radius: 0 !important;
            object-fit: cover !important;
            object-position: center center !important;
          }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-product-premium { animation: none; transform: none; }
          .hero-orbit-ring { animation: none; }
          .hero-spark { animation: none; }
          .hero-scanline { display: none; }
          .hero-particle { display: none; }
          .antigrav-particle { display: none; }
        }
      `}</style>
    </section>
  );
}
