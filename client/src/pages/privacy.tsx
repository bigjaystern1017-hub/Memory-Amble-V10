import { useLocation } from "wouter";
import { Brain, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
        <h1 className="font-serif text-2xl text-center mb-8">Privacy Policy</h1>
        <p className="text-gray-400 text-center -mt-4">Last updated: May 7, 2026</p>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">What We Collect</h2>
          <p>When you create an account, we collect your email address and display name. When you use the app, we store your session data including palace names, stop names, objects placed, and scores. This data is used solely to personalize your experience and track your progress.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">What We Don't Collect</h2>
          <p>MemoryAmble is not a medical app. We do not collect health records, diagnoses, or any protected health information. We are not subject to HIPAA. We do not sell, share, or provide your personal data to any third party.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">How We Use Your Data</h2>
          <p>Your data is used to: save your progress between sessions, personalize Coach Timbuk's responses, generate your Amble Scroll after each session, and send you optional daily reminder emails (which you can turn off anytime from your Account page).</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use advertising cookies or tracking pixels.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Data Storage</h2>
          <p>Your data is stored securely via Supabase (PostgreSQL) with encryption in transit. Payment processing is handled by Stripe — we never see or store your credit card number.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Your Rights</h2>
          <p>You can request deletion of your account and all associated data at any time by emailing hello@memoryamble.com. We will delete your data within 7 business days.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg text-primary font-bold">Contact</h2>
          <p>Questions about your privacy? Email us at <a href="mailto:hello@memoryamble.com" className="text-primary underline">hello@memoryamble.com</a></p>
        </section>
      </main>
    </div>
  );
}
