import { useState, useEffect } from "react";
import { playSound } from "@/lib/sounds";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight, Brain, CheckCircle2, Clock, Heart, LogOut,
  MapPin, PersonStanding, ShieldCheck, Sparkles, Star,
  Target, TrendingUp
} from "lucide-react";
import timbukAvatar from "@assets/timbuk-hero-clean-bg_1776110930296.png";
import familyDrawing from "@assets/family-drawing_1775912885165.png";
import iconHouse from "@assets/icon-house_1778244069718.png";
import iconPineapple from "@assets/icon-pineapple_1778244069701.png";
import iconBrain from "@assets/icon-brain_1778244082944.png";

const HERO_IMAGE = "/memory-palace-hero.png";
const PURPLE = "#5B35D5";

function TrustItem({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[#5B35D5]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#24114F]">{title}</p>
        <p className="text-xs leading-snug text-[#6B6280]">{text}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, text, icon: Icon }: { number: string; title: string; text: string; icon: any }) {
  return (
    <div className="group rounded-[2rem] border border-purple-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5B35D5] text-sm font-bold text-white">{number}</div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#5B35D5]">
          <Icon size={26} />
        </div>
      </div>
      <h3 className="mb-3 font-serif text-2xl font-bold text-[#24114F]">{title}</h3>
      <p className="text-sm leading-6 text-[#635979]">{text}</p>
    </div>
  );
}

function Benefit({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-purple-100">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EAFE] text-[#5B35D5]">
        <Icon size={24} />
      </div>
      <h3 className="mb-2 text-lg font-bold text-[#24114F]">{title}</h3>
      <p className="text-sm leading-6 text-[#635979]">{text}</p>
    </div>
  );
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="rounded-[1.75rem] border border-purple-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-1 text-[#F2B84B]">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
      </div>
      <p className="mb-6 text-sm leading-6 text-[#3E315F]">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-orange-100 text-sm font-bold text-[#24114F]">{name.charAt(0)}</div>
        <div>
          <p className="text-sm font-bold text-[#24114F]">{name}</p>
          <p className="text-xs text-[#7B7190]">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const { isAuthenticated, signOut } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const localDay = localStorage.getItem("memory-amble-day");
    setCurrentDay(localDay ? parseInt(localDay, 10) : 1);
  }, []);

  const ctaLabel = currentDay > 1 ? `Continue Day ${currentDay}` : "Try Day 1 Free";

  function handleCta() {
    playSound("click");
    navigate("/amble");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FBF6EE] text-[#24114F]">

      {/* HEADER */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5B35D5] text-white shadow-lg shadow-purple-200">
            <img src={iconBrain} alt="Brain" className="w-7 h-7" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">MemoryAmble</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#3E315F] md:flex">
          <a href="#how" className="hover:text-[#5B35D5] transition-colors">How It Works</a>
          <a href="#science" className="hover:text-[#5B35D5] transition-colors">Science</a>
          <a href="#stories" className="hover:text-[#5B35D5] transition-colors">Stories</a>
          <a href="#story" className="hover:text-[#5B35D5] transition-colors">Our Story</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="hidden md:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#3E315F] border border-purple-100 bg-white hover:bg-purple-50 transition-colors"
            >
              <LogOut size={15} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#3E315F] border border-purple-100 bg-white hover:bg-purple-50 transition-colors"
            >
              Sign In
            </button>
          )}
          <button
            data-testid="button-cta-header"
            onClick={handleCta}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
          >
            {ctaLabel}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto w-full max-w-[1280px] px-5 lg:px-12" style={{ minHeight: "calc(100vh - 96px)", display: "flex", alignItems: "center" }}>
        <div className="w-full grid items-center gap-10 py-12 lg:py-16 lg:grid-cols-[45%_55%]">

          {/* Text column */}
          <div className="relative z-10" style={{ maxWidth: "560px" }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5B35D5] shadow-sm ring-1 ring-purple-100">
              <Sparkles size={15} /> Ancient wisdom. Modern memory.
            </div>

            <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.04em] text-[#24114F] text-5xl sm:text-6xl lg:text-6xl xl:text-7xl">
              Build a memory that lasts.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#5C5373]">
              Learn the Memory Palace technique through simple daily walks, stories, and spatial memory training — guided by your coach Timbuk, designed for real life.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                data-testid="button-cta-hero"
                onClick={handleCta}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
              >
                {ctaLabel} <ArrowRight size={18} />
              </button>
              <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#5B35D5] hover:bg-purple-50 transition-colors">
                See how it works
              </a>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-3">
              <TrustItem icon={Clock} title="10 min/day" text="Short guided sessions" />
              <TrustItem icon={ShieldCheck} title="Science-backed" text="Based on Method of Loci" />
              <TrustItem icon={Heart} title="Made for life" text="Practical everyday recall" />
            </div>
          </div>

          {/* Image column */}
          <div className="flex items-end justify-end">
            <img
              src={HERO_IMAGE}
              alt="People exploring a Memory Palace landscape"
              className="w-full object-contain"
              style={{ objectPosition: "right bottom", maxHeight: "620px" }}
            />
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white/58 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">How it works</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#24114F] sm:text-5xl">Your mind is a place. We help you build it.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard number="1" icon={MapPin} title="Place it" text="Attach names, facts, or ideas to memorable locations inside a familiar mental space — your home, a favourite walk." />
            <StepCard number="2" icon={PersonStanding} title="Walk it" text="Move through your Memory Palace with calm, guided prompts from Timbuk that make recall feel natural and fun." />
            <StepCard number="3" icon={Brain} title="Recall it" text="Retrieve what you need by revisiting the places and vivid anchors you created. Whatever you planted will be waiting." />
          </div>

          <div className="mt-12 text-center">
            <button
              data-testid="button-cta-how"
              onClick={handleCta}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
            >
              Try the Technique Free <ArrowRight size={18} />
            </button>
            <p className="mt-3 text-sm text-[#7B7190]">Day 1 is on us. No card needed.</p>
          </div>
        </div>
      </section>

      {/* SCIENCE */}
      <section id="science" className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">Backed by science</p>
            <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-[#24114F] sm:text-5xl">An ancient technique, rebuilt for modern life.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#635979]">
              The Method of Loci, also known as the Memory Palace technique, uses spatial association to help people remember information more naturally. Used by scholars for millennia — now guided, personal, and surprisingly fun.
            </p>
            <button
              data-testid="button-cta-science"
              onClick={handleCta}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
            >
              {ctaLabel} <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Benefit icon={Target} title="Stronger recall" text="Practice remembering names, lists, facts, and everyday details the way scholars have for thousands of years." />
            <Benefit icon={Sparkles} title="More engaging" text="Train memory through places and stories instead of sterile drills. Timbuk makes it feel like play, not work." />
            <Benefit icon={CheckCircle2} title="Easy to start" text="No complicated setup. Start with Day 1 in minutes and build your first Memory Palace right away." />
            <Benefit icon={TrendingUp} title="Track progress" text="See your memory practice become a repeatable daily habit with streaks and a growing palace collection." />
          </div>
        </div>
      </section>

      {/* MEET TIMBUK */}
      <section className="bg-amber-50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">Your guide</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#24114F] sm:text-5xl">Meet Timbuk</h2>
          </div>
          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-shrink-0 flex items-center justify-center">
              <div
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: "#fef9f0", width: "260px", height: "260px" }}
              >
                <img
                  src={timbukAvatar}
                  alt="Timbuk"
                  style={{ width: "240px", height: "240px", objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="text-center md:text-left space-y-4">
              <p className="text-[#635979] leading-relaxed text-lg">
                Timbuk is your personal memory coach — warm, wise, and slightly arch. He teaches through doing, not lecturing. He remembers your associations, celebrates your wins, and never makes you feel tested. He has been doing this for a very long time.
              </p>
              <p className="text-[#9B91B0] italic text-sm">He also has opinions about penguins.</p>
              <button
                data-testid="button-cta-timbuk"
                onClick={handleCta}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
              >
                Meet Timbuk — Day 1 is Free <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="bg-[#F4EEFF] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">Real people. Real practice.</p>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-[#24114F]">They were skeptical too.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#635979]">MemoryAmble is designed for curious adults who want a calmer, more visual way to stay sharp.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial quote="I remembered every name at my grandson's birthday party for the first time in three years. My daughter noticed." name="Margaret" role="Age 71" />
            <Testimonial quote="I was skeptical. Ten minutes later I had built something I was genuinely proud of. Timbuk makes it feel like play." name="Robert" role="Retired engineer, 68" />
            <Testimonial quote="It feels beautiful and practical at the same time. Not like another brain game. Something real." name="Dorothy" role="Age 74" />
          </div>

          <div className="mt-12 text-center">
            <button
              data-testid="button-cta-stories"
              onClick={handleCta}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-[#5B35D5] text-white shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200"
            >
              Try Day 1 Free — No Card Needed <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section id="story" className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-start gap-10 md:gap-16">
            <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
              <div className="flex flex-col items-center">
                <img src={familyDrawing} alt="Family illustration" className="w-56 md:w-72 rounded-xl shadow-md object-cover" />
                <p className="text-xs text-[#9B91B0] italic text-center mt-2">My dad and his granddaughter</p>
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">Our story</p>
              <h2 className="font-serif text-4xl font-bold text-[#24114F]">Built for one person first.</h2>
              <div className="text-[#635979] leading-relaxed space-y-4">
                <p>My dad's sharp, funny, and present — a lifelong learner. But he noticed in the past few years he didn't feel quite as sharp as he always had.</p>
                <p>He was looking for a way to train his memory the way he trained his body. Not a puzzle app. Not a quiz. Something real.</p>
                <p>I'd learned memory training years before, used it myself, and saw how fun and powerful it could be — what could genuinely be accomplished by working on your memory for just a few minutes a day.</p>
                <p>That was the genesis for MemoryAmble. Something warm, patient, and genuinely useful — that made him feel capable, not tested.</p>
                <p>If you have someone in your life like that — or if you are that person — this was built for you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-white/58 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B35D5]">Pricing</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#24114F] sm:text-5xl">Priced for everyone.</h2>
            <p className="mt-4 text-base leading-7 text-[#635979]">Memory training courses run $1,200 to $3,000. We priced MemoryAmble at $8.47 a month deliberately — because this should be available to everyone.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-[2rem] border-2 p-8 space-y-6 flex flex-col bg-white" style={{ borderColor: PURPLE }}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: PURPLE }}>MemoryAmble</p>
                <p className="text-5xl font-bold text-[#24114F]">$8.47</p>
                <p className="text-[#9B91B0] mt-1 text-sm">per month · Less than 30 cents a day</p>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  "30-day guided memory bootcamp",
                  "Daily sessions with Timbuk",
                  "Streak tracking",
                  "Round up to donate to memory research",
                  "Your Amble Scroll after every session",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#3E315F]">
                    <span className="mt-0.5 font-bold" style={{ color: PURPLE }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                data-testid="button-cta-pricing"
                onClick={handleCta}
                className="w-full py-3 rounded-full text-white font-semibold hover:-translate-y-0.5 hover:bg-[#4C2BC4] transition-all duration-200 shadow-lg shadow-purple-200"
                style={{ backgroundColor: PURPLE }}
              >
                Try Day 1 Free
              </button>
            </div>

            <div className="rounded-[2rem] border border-purple-100 p-8 space-y-6 flex flex-col bg-white">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#9B91B0] mb-1">MemoryAmble Pro</p>
                <p className="text-5xl font-bold text-[#24114F]">$19.97</p>
                <p className="text-[#9B91B0] mt-1 text-sm">per month</p>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  "Everything in MemoryAmble",
                  "Extended session history",
                  "Advanced palace analytics",
                  "Family sharing — up to 3 members",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#3E315F]">
                    <span className="mt-0.5 font-bold text-[#9B91B0]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-full border border-purple-100 text-[#3E315F] font-semibold hover:bg-purple-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[#9B91B0] mt-8 max-w-lg mx-auto">
            A portion of every subscription funds Sanfilippo syndrome and Alzheimer's research. The more people we reach, the more we can fund the fight.
          </p>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#3F238E] p-8 text-white shadow-2xl shadow-purple-200 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-purple-200">Start here</p>
              <h2 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Your memory is waiting.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-purple-100">When you're ready — Day 1 is on us. Complete it and unlock your free week.</p>
            </div>
            <button
              data-testid="button-cta-final"
              onClick={handleCta}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-white text-[#3F238E] hover:bg-purple-50 transition-colors shadow-lg whitespace-nowrap"
            >
              {ctaLabel} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-purple-100 py-6 px-5">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[#9B91B0]">
          <span>© 2026 MemoryAmble</span>
          <span className="text-center">Built with care for those who deserve a sharper mind.</span>
          <a href="mailto:hello@memoryamble.com" className="hover:text-[#5B35D5] transition-colors">
            hello@memoryamble.com
          </a>
        </div>
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-3 mt-3 text-sm text-[#9B91B0]">
          <a href="/privacy" className="underline hover:text-[#5B35D5] transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="underline hover:text-[#5B35D5] transition-colors">Terms of Service</a>
        </div>
      </footer>

    </main>
  );
}
