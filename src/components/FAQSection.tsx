import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Truck, ShieldCheck, RefreshCw } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "item-1",
    question: "What is Vurlo and where are you based?",
    answer:
      "Vurlo is India's premium ambient lighting and aesthetic room decor brand. We curate the highest quality RGB lights, sunset lamps, galaxy projectors, and desk aesthetics. We are based in India and ship directly to setup enthusiasts nationwide.",
  },
  {
    id: "item-2",
    question: "Do you offer free shipping across India?",
    answer:
      "Yes, we offer 100% free shipping on all orders across India with no minimum cart value. Every package is securely wrapped and shipped with leading logistics partners.",
  },
  {
    id: "item-3",
    question: "How long does delivery take?",
    answer:
      "Orders are processed within 24 hours. Delivery typically takes 3 to 7 business days depending on your city. A tracking link is automatically sent to your email and phone number as soon as the order is dispatched.",
  },
  {
    id: "item-4",
    question: "What is your return and refund policy?",
    answer:
      "We offer a customer-friendly 7-day replacement/refund policy for any item that arrives damaged, defective, or incorrect. Simply contact us with an unboxing video/photo, and we will arrange a replacement or refund immediately.",
  },
  {
    id: "item-5",
    question: "Are payments secure on Vurlo?",
    answer:
      "Absolutely. We use Razorpay, India's leading payment processor, to handle all transactions. Your payment is 100% secure and SSL-encrypted. We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and Wallets.",
  },
];

export function FAQSection() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-20 border-t border-white/[0.06] text-left">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-sm text-white/50 max-w-xl mx-auto">
          Got questions about shipping, delivery, or our aesthetic lights? We've got answers.
        </p>
      </div>

      <div className="bg-white/[0.01] border border-white/[0.06] backdrop-blur-md rounded-2xl p-6 md:p-8">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-white/[0.06] last:border-b-0"
            >
              <AccordionTrigger className="text-base font-semibold text-white/90 hover:text-white hover:no-underline transition-colors py-4">
                <span className="flex items-center gap-3">
                  <HelpCircle className="h-4 w-4 text-violet-400 shrink-0" />
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-white/60 leading-relaxed pl-7">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Trust micro-badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
        <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <Truck className="h-5 w-5 text-violet-400 mb-2" />
          <h3 className="text-xs font-semibold text-white">Free India-Wide Delivery</h3>
          <p className="text-[10px] text-white/40 mt-1">3-7 business days tracking</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <ShieldCheck className="h-5 w-5 text-cyan-400 mb-2" />
          <h3 className="text-xs font-semibold text-white">100% Secure Payments</h3>
          <p className="text-[10px] text-white/40 mt-1">Powered by Razorpay & SSL</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <RefreshCw className="h-5 w-5 text-violet-400 mb-2" />
          <h3 className="text-xs font-semibold text-white">7-Day Hassle-Free Returns</h3>
          <p className="text-[10px] text-white/40 mt-1">For damaged or defective items</p>
        </div>
      </div>
    </section>
  );
}
