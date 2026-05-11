import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Brain, Flame, MapPin, Route, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

const DAY_ITEMS: Record<number, number> = { 1: 3, 2: 5, 3: 5, 4: 8, 5: 10 };
const DAY_LABELS: Record<number, string> = {
  1: "The Foundation",
  2: "The Expansion",
  3: "The Reverse",
  4: "The Stretch",
  5: "The Graduation",
};

export default function Start() {
  const [, navigate] = useLocation();

  const [currentDay, setCurrentDay] = useState(1);
  const [userName, setUserName] = useState("");
  const [savedStops, setSavedStops] = useState<string[]>([]);
  const [isReturning, setIsReturning] = useState(false);

  // New-user flow state
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dayRaw = localStorage.getItem("memory-amble-day");
    const day = dayRaw ? parseInt(dayRaw, 10) : 1;
    const name = localStorage.getItem("memory-amble-name") || "";
    const palaceRaw = localStorage.getItem("memory-amble-palace");
    const stops = palaceRaw ? (() => { try { return JSON.parse(palaceRaw); } catch { return []; } })() : [];

    setCurrentDay(day);
    setUserName(name);
    setSavedStops(Array.isArray(stops) ? stops : []);
    setIsReturning(day > 1 || (stops && stops.length > 0));
  }, []);

  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [step]);

  function handleGoal(value: string) {
    localStorage.setItem("memoryamble-goal", value);
    setStep(2);
  }

  const displayName = userName || "friend";
  const itemCount = DAY_ITEMS[currentDay] ?? 5;
  const dayLabel = DAY_LABELS[currentDay] ?? `Day ${currentDay}`;

  // ── RETURN-USER DASHBOARD ──
  if (isReturning) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
        style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FAF7FF 40%, #FEF9F0 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: "#26215C" }}>MemoryAmble</span>
        </div>

        {/* Main card */}
        <div
          className="w-full rounded-3xl overflow-hidden"
          style={{
            maxWidth: 960,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3F4",
            boxShadow: "0 4px 28px rgba(109,45,226,0.10)",
          }}
        >
          {/* Purple top accent */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #6D2DE2 0%, #A78BFA 100%)" }} />

          <div className="grid md:grid-cols-[1fr_320px] gap-0">

            {/* ── LEFT: Welcome copy ── */}
            <div className="px-8 md:px-12 py-10 space-y-7">

              {/* Day pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: "#EDE9FE", color: "#6D2DE2" }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Day {currentDay} — {dayLabel}
              </div>

              {/* Welcome heading */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight" style={{ color: "#1A1028" }}>
                  Welcome back{userName ? `, ${displayName}` : ""}.
                </h1>
                <p className="text-lg" style={{ color: "#5B4B8A" }}>
                  Your Memory Palace is waiting.
                </p>
              </div>

              {/* Today's session info */}
              <div
                className="rounded-2xl px-6 py-4 space-y-1"
                style={{ backgroundColor: "#F5F0FF", border: "1px solid #DDD5F8" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9C8BB4" }}>Today's walk</p>
                <p className="text-base font-semibold" style={{ color: "#3D2E6E" }}>
                  {itemCount} items · {dayLabel}
                </p>
                <p className="text-sm" style={{ color: "#9C8BB4" }}>
                  Today we'll strengthen the route you've already begun.
                </p>
              </div>

              {/* Timbuk quote */}
              <div className="flex items-start gap-3">
                <img
                  src={timbukAvatarPath}
                  alt="Timbuk"
                  className="w-10 h-10 rounded-full shrink-0 mt-0.5"
                />
                <div
                  className="rounded-2xl px-4 py-3 text-sm italic leading-relaxed"
                  style={{ backgroundColor: "#FAFAFE", border: "1px solid #EDE9FA", color: "#5B4B8A" }}
                >
                  "Your route is still there. Let's walk it again."
                </div>
              </div>

              {/* Method tag */}
              <p className="text-sm font-medium" style={{ color: "#C4B5FD" }}>
                Don't memorize. Walk.
              </p>

              {/* CTA */}
              <div className="space-y-3 pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-base px-8 py-6"
                  onClick={() => navigate("/amble")}
                  data-testid="button-start-walk"
                >
                  <Sparkles className="w-4 h-4" />
                  Begin today's walk
                </Button>
                <p className="text-xs" style={{ color: "#C4B5FD" }}>
                  A few minutes is enough.
                </p>
              </div>
            </div>

            {/* ── RIGHT: Route preview ── */}
            <div
              className="px-7 py-10 border-t md:border-t-0 md:border-l space-y-5"
              style={{ borderColor: "#EDE9F8", backgroundColor: "#FAFAFE" }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4" style={{ color: "#9C8BB4" }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9C8BB4" }}>
                    Your route
                  </p>
                </div>
                <p className="text-xs" style={{ color: "#C4B5FD" }}>Your memory palace stops</p>
              </div>

              {savedStops.length > 0 ? (
                <div className="space-y-2">
                  {savedStops.map((stop: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #EDE9FA" }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: "#EDE9FE", color: "#6D2DE2" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium capitalize" style={{ color: "#3D2E6E" }}>
                        {stop}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-center italic pt-1" style={{ color: "#C4B5FD" }}>
                    Your mind already knows the way.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-xl px-4 py-5 text-center"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #EDE9FA" }}
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: "#DDD5F8" }} />
                  <p className="text-sm italic" style={{ color: "#C4B5FD" }}>
                    Timbuk will help you choose a place when we begin.
                  </p>
                </div>
              )}

              {/* Day progress */}
              <div
                className="rounded-xl px-4 py-4 space-y-2"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #EDE9FA" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9C8BB4" }}>5-day bootcamp</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor: d < currentDay
                          ? "#6D2DE2"
                          : d === currentDay
                          ? "#C4B5FD"
                          : "#EDE9FE",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#9C8BB4" }}>
                  Day {currentDay} of 5
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skip / go home */}
        <button
          className="mt-6 text-xs underline-offset-2 hover:underline transition-colors"
          style={{ color: "#C4B5FD" }}
          onClick={() => navigate("/")}
          data-testid="button-go-home"
        >
          Back to home
        </button>
      </div>
    );
  }

  // ── NEW-USER FLOW (unchanged logic, restyled) ──
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FAF7FF 40%, #FEF9F0 100%)" }}
    >
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-serif text-xl font-semibold" style={{ color: "#26215C" }}>MemoryAmble</span>
      </div>

      {step === 1 && (
        <div className="w-full flex flex-col items-center gap-5">
          <h1 className="font-serif text-2xl text-center" style={{ color: "#26215C" }}>
            What matters most to you right now?
          </h1>
          <div className="w-full flex flex-col items-center gap-3">
            {[
              { label: "Remembering names and faces", value: "names" },
              { label: "Staying sharp for my family", value: "sharp" },
              { label: "Keeping my mind active", value: "active" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleGoal(value)}
                className="w-full max-w-sm mx-auto py-4 px-6 bg-white rounded-xl shadow-sm border border-purple-200 text-lg text-gray-700 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer text-left"
                data-testid={`button-goal-${value}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div
          className="flex flex-col items-center gap-6 text-center transition-opacity duration-500"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <img
            src={timbukAvatarPath}
            alt="Timbuk"
            className="rounded-full object-cover"
            style={{ width: 80, height: 80 }}
          />
          <h1 className="font-serif text-2xl" style={{ color: "#26215C" }}>
            Timbuk is ready for you.
          </h1>
          <p className="text-gray-500">Day 1 takes 10 minutes. No account needed.</p>
          <button
            onClick={() => navigate("/amble")}
            className="bg-primary text-white py-4 px-8 rounded-full text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity"
            data-testid="button-start-walk"
          >
            Start My First Walk →
          </button>
          <p className="text-xs text-gray-400">Free. No credit card.</p>
        </div>
      )}
    </div>
  );
}
