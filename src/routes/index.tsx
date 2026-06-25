import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { HeroLoader } from "@/components/HeroLoader";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Categories } from "@/components/Categories";
import { WhyVurlo } from "@/components/WhyVurlo";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";

type IndexSearchParams = {
  category?: string;
  sale?: boolean;
};

// ── JSON-LD: Organization + WebSite schema ────────────────────────────────────
const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vurlo.store/#organization",
      name: "Vurlo",
      url: "https://vurlo.store",
      logo: {
        "@type": "ImageObject",
        url: "https://vurlo.store/preview.jpg",
      },
      sameAs: [
        "https://instagram.com/vurlo.store",
        "https://twitter.com/vurlostore",
        "https://youtube.com/@vurlo"
      ],
      description:
        "Vurlo is India's premium ambient lighting brand offering RGB lights, sunset lamps, galaxy projectors, crystal lamps, and aesthetic room decor.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1050",
      },
      review: [
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Rohit Sharma",
          },
          reviewBody: "Got the RGB strip lights for my hostel room and honestly wasn't expecting much at this price. But the colors are actually really good, the app works fine and it sticks properly.",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
          },
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Priya Nair",
          },
          reviewBody: "Ordered the humidifier lamp mostly for the aesthetic and it looks exactly like the photos. Been using it for 2 months now, no issues. The mist is quiet so it doesn't disturb calls.",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
          },
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Arjun Verma",
          },
          reviewBody: "The moon lamp I ordered for my desk is genuinely nice. The glow is warm and not too harsh for late nights. Packaging was also good, came without any damage.",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://vurlo.store/#website",
      url: "https://vurlo.store",
      name: "Vurlo",
      publisher: { "@id": "https://vurlo.store/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://vurlo.store/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://vurlo.store/#webpage",
      url: "https://vurlo.store",
      name: "Vurlo – Premium Ambient Lighting & Aesthetic Room Decor India",
      description:
        "Shop Vurlo for premium RGB lights, sunset lamps, galaxy projectors, crystal ball lamps, and aesthetic room decor. Free shipping across India.",
      isPartOf: { "@id": "https://vurlo.store/#website" },
      publisher: { "@id": "https://vurlo.store/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://vurlo.store/#faq",
      "isPartOf": { "@id": "https://vurlo.store/#webpage" },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Vurlo and where are you based?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Vurlo is India's premium ambient lighting and aesthetic room decor brand. We curate the highest quality RGB lights, sunset lamps, galaxy projectors, and desk aesthetics. We are based in India and ship directly to setup enthusiasts nationwide."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer free shipping across India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we offer 100% free shipping on all orders across India with no minimum cart value. Every package is securely wrapped and shipped with leading logistics partners."
          }
        },
        {
          "@type": "Question",
          "name": "How long does delivery take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Orders are processed within 24 hours. Delivery typically takes 3 to 7 business days depending on your city. A tracking link is automatically sent to your email and phone number as soon as the order is dispatched."
          }
        },
        {
          "@type": "Question",
          "name": "What is your return and refund policy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer a customer-friendly 7-day replacement/refund policy for any item that arrives damaged, defective, or incorrect. Simply contact us with an unboxing video/photo, and we will arrange a replacement or refund immediately."
          }
        },
        {
          "@type": "Question",
          "name": "Are payments secure on Vurlo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. We use Razorpay, India's leading payment processor, to handle all transactions. Your payment is 100% secure and SSL-encrypted. We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and Wallets."
          }
        }
      ]
    }
  ],
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearchParams => {
    return {
      category: (search.category as string) || undefined,
      sale: (search.sale as boolean) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Vurlo – Premium Ambient Lighting & Aesthetic Room Decor India" },
      {
        name: "description",
        content:
          "Shop Vurlo for premium RGB lights, sunset lamps, galaxy projectors, crystal ball lamps & aesthetic room decor. Free shipping across India. Elevate your setup today.",
      },
      { name: "robots", content: "index, follow" },
      { name: "keywords", content: "rgb lights india, sunset lamp, ambient lighting, galaxy projector, crystal lamp, aesthetic room decor, bedroom lighting india, gaming setup lights" },

      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vurlo.store" },
      { property: "og:title", content: "Vurlo – Premium Ambient Lighting & Aesthetic Room Decor" },
      { property: "og:description", content: "Premium RGB lights, sunset lamps, galaxy projectors & aesthetic room decor. Free shipping across India." },
      { property: "og:image", content: "https://vurlo.store/preview.jpg" },
      { property: "og:site_name", content: "Vurlo" },
      { property: "og:locale", content: "en_IN" },

      // Twitter
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:url", content: "https://vurlo.store" },
      { property: "twitter:title", content: "Vurlo – Premium Ambient Lighting & Aesthetic Room Decor" },
      { property: "twitter:description", content: "Premium RGB lights, sunset lamps, galaxy projectors & aesthetic room decor. Free shipping across India." },
      { property: "twitter:image", content: "https://vurlo.store/preview.jpg" },
    ],
  }),
  component: Index,
});

function Index() {
  const { category, sale } = Route.useSearch();

  return (
    <main className="min-h-screen bg-background text-foreground page-transition">
      {/* JSON-LD – Organization + WebSite + SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />

      <Navbar />

      {/* Hidden SEO block – crawlable, invisible to users */}
      <div className="sr-only" aria-hidden="true">
        <h1>Vurlo – Premium Ambient Lighting & Aesthetic Room Decor Store in India</h1>
        <p>
          Vurlo is India's leading premium ambient lighting brand. We sell RGB lights, sunset
          projection lamps, galaxy projectors, crystal ball night lamps, LED strip lights, moon
          lamps, humidifier lamps, and aesthetic room decor. Free shipping across India.
        </p>
        <h2>What is Vurlo?</h2>
        <p>
          Vurlo is a premium Indian aesthetic lighting brand founded to help people transform their
          bedrooms, gaming setups, and workspaces with high-quality ambient lighting. Every product
          is curated for design, build quality, and vibe — from viral sunset lamps to cosmic galaxy
          projectors and handcrafted infinity bloom lamps.
        </p>
        <h2>Our Products</h2>
        <ul>
          <li>Sunset Projection Lamp – RGB ambient light for gaming setup and bedroom decor</li>
          <li>Orbit Galaxy Projector – Smart nebula night light for gaming rooms</li>
          <li>3D Lunar Moon Lamp – Wooden base aesthetic bedroom night light</li>
          <li>Crystal Aura Lamp – 3D laser engraved glass ball night light</li>
          <li>AquaWave Projector Lamp – Ocean wave kinetic RGB ambient light</li>
          <li>Aura RGB LED Strip Lights – Smart gaming setup backlighting kit</li>
          <li>MistFlow Humidifier Lamp – Cool mist 2-in-1 ambient desk light</li>
          <li>Infinity Bloom Lamp – Handmade tulip infinity mirror night light</li>
          <li>Panda Night Lamp – Cute LED ambient light for bedroom and kids</li>
        </ul>
        <h2>Why Choose Vurlo?</h2>
        <ul>
          <li>Premium quality aesthetic lighting products curated for Indian setups</li>
          <li>Free shipping on all orders across India</li>
          <li>Trusted by over 1000 satisfied customers</li>
          <li>Secure checkout with SSL encryption</li>
          <li>Wide range of RGB lights, sunset lamps, and ambient decor for every budget</li>
        </ul>
        <h2>Ambient Lighting for Bedroom Decor India</h2>
        <p>
          The right ambient lighting can completely transform the feel of your bedroom. Vurlo's
          collection of sunset lamps, moon lamps, and galaxy projectors are specifically designed for
          Indian bedroom setups — warm, aesthetic, and instantly mood-lifting. Whether you want a
          cozy night vibe or an energetic gaming room atmosphere, Vurlo has the perfect light for
          you.
        </p>
        <h2>Gaming Setup Lights India</h2>
        <p>
          Level up your battlestation with Vurlo's range of RGB gaming setup lights including LED
          strip lights, galaxy projectors, and sunset projection lamps. Designed to add depth, color,
          and cinematic ambiance to any gaming desk or streaming setup in India.
        </p>
      </div>

      <HeroLoader />
      <FeaturedProducts category={category} sale={sale} />
      <Categories />
      <WhyVurlo />
      <Testimonials />

      {/* Homepage SEO Articles – visible, styled */}
      <section
        aria-labelledby="seo-articles-heading"
        className="mx-auto max-w-7xl px-6 py-20 border-t border-white/[0.06] text-left"
      >
        <h2
          id="seo-articles-heading"
          className="sr-only"
        >
          Lighting Guides & Room Setup Tips
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Article 1 */}
          <article className="space-y-4 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm relative overflow-hidden group hover:border-violet-500/25 transition-all duration-300">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-all duration-300" />
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Best RGB Lights for Rooms in India 2025
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Finding the right RGB lights for your room in India can be overwhelming — but the
              difference between a dull space and an aesthetic setup often comes down to just one
              light. Whether you're building a gaming battlestation, a cozy bedroom corner, or a
              content creation studio, RGB ambient lighting sets the entire mood. Sunset projection
              lamps cast a warm golden halo across your walls. Galaxy projectors fill your ceiling
              with moving nebula clouds and laser stars. LED strip lights outline your desk or bed
              frame with millions of colors. Vurlo's entire collection is curated for Indian rooms —
              compact, premium build, and priced fairly. Free shipping on every order.
            </p>
          </article>

          {/* Article 2 */}
          <article className="space-y-4 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/25 transition-all duration-300">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300" />
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              How to Create an Aesthetic Room Setup
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              An aesthetic room setup starts with lighting — everything else follows. Begin with a
              key ambient light like a sunset lamp or galaxy projector as your focal point, then
              layer in LED strip lights along your desk or shelves for depth. Choose warm tones for a
              cozy bedroom vibe, or cool purples and blues for a gaming energy. Keep surfaces clean
              and minimal so the lighting does the talking. Small upgrades like a crystal ball lamp
              on your desk or an infinity bloom lamp on your nightstand make a huge visual impact.
              Vurlo's products are designed specifically so anyone can build a premium aesthetic setup
              without spending a fortune — every piece ships free across India.
            </p>
          </article>

          {/* Article 3 */}
          <article className="space-y-4 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm relative overflow-hidden group hover:border-violet-500/25 transition-all duration-300">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-all duration-300" />
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              What is Vurlo? India's Premium Ambient Lighting Brand
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Vurlo is an Indian premium lighting brand built for people who care deeply about their
              space. We curate only the best ambient lights — sunset lamps, galaxy projectors, moon
              lamps, crystal ball lights, RGB strips, ocean wave projectors, and more. Every product
              is chosen for its design quality, build, and ability to instantly transform a room's
              atmosphere. Trusted by 1000+ customers across India, Vurlo ships free on all orders
              with secure checkout. Whether you want a cozy bedroom vibe, a cinematic gaming setup,
              or a unique handcrafted gift, Vurlo has the right light for every setup and every mood.
            </p>
          </article>

          {/* Article 4 */}
          <article className="space-y-4 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/25 transition-all duration-300">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300" />
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Gaming Setup Lights – Upgrade Your Battlestation
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Your gaming setup is only as good as its lighting. The right RGB lights don't just look
              great on stream — they reduce eye strain during long sessions and create an immersive
              environment that puts you in the zone. Vurlo's gaming setup lights range from RGB LED
              strips for desk backlighting to galaxy projectors that transform your ceiling into a
              cosmic backdrop. The sunset lamp is a viral favourite among Indian streamers and
              YouTubers for its warm, cinematic projection. Add a crystal ball lamp to your desk for
              a premium aesthetic focal point. Build your dream battlestation with Vurlo — all lights
              ship free across India.
            </p>
          </article>
        </div>
      </section>

      <FAQSection />

      <Newsletter />
      <Footer />
    </main>
  );
}
