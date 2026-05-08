import { useLocation } from "wouter";
import { Brain, ArrowLeft } from "lucide-react";

export default function Terms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-lg font-semibold">MemoryAmble</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-12 font-sans text-sm text-gray-700 space-y-6">
        <h1 className="font-serif text-2xl text-center mb-8">Terms of Service</h1>
        <p className="text-gray-400 text-center -mt-4">Last updated: May 7, 2026</p>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">What MemoryAmble Is</h2>
          <p>MemoryAmble is a cognitive fitness app that teaches the Memory Palace technique through guided daily sessions. It is an educational and recreational tool — not a medical device, not a substitute for medical advice, and not a treatment for any condition.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">No Medical Claims</h2>
          <p>While the Memory Palace technique has been studied extensively in peer-reviewed research, MemoryAmble makes no claims about preventing, treating, or curing any disease including dementia or Alzheimer's. We encourage users to consult their healthcare provider for any medical concerns.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Subscriptions and Billing</h2>
          <p>After your free Day 1 session, continued access requires a subscription at $8.47/month with an optional round-up donation. All subscriptions include a 7-day free trial. You can cancel anytime from your Account page or by emailing hello@memoryamble.com. Cancellation takes effect at the end of your current billing period.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">The Alzheimer's Research Donation</h2>
          <p>Users who opt in to the round-up donate $0.53/month to Alzheimer's research through our partnership with recognized research organizations. This donation is included in your subscription charge and is not separately tax-deductible.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Your Content</h2>
          <p>The palace names, stop names, and scene descriptions you create are yours. We use them only to deliver your experience and generate your Amble Scroll. We do not publish, share, or use your content for any other purpose.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Account Termination</h2>
          <p>We reserve the right to terminate accounts that abuse the service. You can delete your account at any time by emailing hello@memoryamble.com.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Contact</h2>
          <p>Questions? Email us at <a href="mailto:hello@memoryamble.com" className="text-primary underline">hello@memoryamble.com</a></p>
        </section>
      </main>
    </div>
  );
}
