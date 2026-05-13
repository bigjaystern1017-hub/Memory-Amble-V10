import { useState, useRef, useEffect } from "react";
import { playSound } from "@/lib/sounds";
import { Trophy, Flame, ArrowLeft, Eye, EyeOff, Download, CheckCircle2, Route, Sparkles, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import timbukAvatar from "@assets/timbuk-avatar_1773957235129.png";
import terraceBg from "@assets/background_table_plate_1778673642748.png";

export interface PendingSessionData {
  date: string;
  level: number;
  category: string;
  score: number;
  totalItems: number;
  assignments: Array<{ stopName: string; object: string }>;
  placeName: string;
  stops: string[];
  dayCount: number;
}

interface AmbleResultsProps {
  correctCount: number;
  totalItems: number;
  streak: number;
  onContinue: () => void;
  isGuest?: boolean;
  userName?: string;
  dayCount?: number;
  currentDay?: number;
  placeName?: string;
  stops?: string[];
  pendingSession?: PendingSessionData;
  userScenes?: string[];
  assignments?: Array<{ stopName: string; object: string }>;
}

const CONFETTI_COUNT = 40;

function ConfettiPiece({ index }: { index: number }) {
  const left = `${(index * 2.5) % 100}%`;
  const delay = `${(index * 0.07) % 1.5}s`;
  const duration = `${1.8 + (index % 6) * 0.2}s`;
  const size = index % 3 === 0 ? 10 : index % 3 === 1 ? 7 : 5;
  const isAmber = index % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        top: "-20px",
        left,
        width: size,
        height: size,
        backgroundColor: isAmber ? "#d97706" : "#fef3c7",
        animation: `confettiFall ${duration} ${delay} ease-in forwards`,
      }}
    />
  );
}

function Confetti() {
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
        {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>
    </>
  );
}

function GraduationBadge({ name, onSave }: { name: string; onSave: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, "#fbbf24");
    grad.addColorStop(1, "#d97706");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fef3c7";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fef3c7";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText("Memory Wiz", cx, cy - 16);

    if (name && name !== "friend") {
      ctx.font = "16px Georgia, serif";
      ctx.fillText(name, cx, cy + 18);
    }

    ctx.font = "11px Georgia, serif";
    ctx.fillStyle = "rgba(254,243,199,0.8)";
    ctx.fillText("Week 1 Graduate", cx, cy + 40);
  }, [name]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "memory-wiz-badge.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    onSave();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl scale-110" />
        <canvas
          ref={canvasRef}
          className="relative rounded-full shadow-xl"
          style={{ width: 180, height: 180 }}
          data-testid="badge-canvas"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
        onClick={handleSave}
        data-testid="button-save-badge"
      >
        <Download className="w-4 h-4" />
        Save Badge
      </Button>
    </div>
  );
}

export function AmbleResults({
  correctCount,
  totalItems,
  streak,
  onContinue,
  isGuest,
  userName,
  dayCount = 0,
  currentDay = 0,
  placeName,
  stops = [],
  pendingSession,
  userScenes,
  assignments,
}: AmbleResultsProps) {
  const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const isPerfect = totalItems > 0 && correctCount === totalItems;
  const isGraduation = currentDay === 7 && correctCount >= totalItems * 0.8;

  const [showConversion, setShowConversion] = useState(false);
  const [shareButtonText, setShareButtonText] = useState("Share My Scroll");
  const [authMode, setAuthMode] = useState<"choice" | "email">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [badgeSaved, setBadgeSaved] = useState(false);
  const [scrollPhase, setScrollPhase] = useState<"hidden" | "prompt" | "loading" | "revealed">("prompt");
  const [scrollText, setScrollText] = useState("");

  const nextDay = dayCount + 2;
  const displayName = userName || "friend";

  const storePendingMigration = () => {
    if (pendingSession) {
      localStorage.setItem("memory-amble-pending-session", JSON.stringify(pendingSession));
      localStorage.setItem("memory-amble-checkout-pending", "true");
    }
  };

  const redirectToCheckout = async (token: string, userEmail: string) => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: userEmail }),
    });
    if (!res.ok) throw new Error("Checkout session creation failed");
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleSeeYouTomorrow = () => {
    playSound("click");
    if (isGuest) {
      setShowConversion(true);
    } else {
      onContinue();
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    storePendingMigration();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/amble` },
    });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setAuthError("");

    if (isSignup) {
      if (password.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/amble` },
      });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }
      storePendingMigration();
      setEmailSent(true);
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }
      storePendingMigration();
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        if (token) {
          await redirectToCheckout(token, email);
          return;
        }
      } catch (e) {
        console.error("Checkout redirect failed:", e);
      }
      window.location.reload();
    }
  };

  const handleShowScroll = async () => {
    playSound("click");
    setScrollPhase("loading");
    playSound("magic-transition");
    try {
      const stopsWithScenes = (assignments || []).map((a, i) => ({
        stopName: a.stopName,
        object: a.object,
        userScene: userScenes?.[i] || "",
      }));
      const res = await fetch("/api/generate-scroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: displayName,
          palaceName: placeName || "your palace",
          dayNumber: currentDay || 1,
          correctCount,
          totalItems,
          stops: stopsWithScenes,
        }),
      });
      const data = await res.json();
      setScrollText(data.scroll || "");
      setScrollPhase("revealed");
    } catch {
      setScrollText(`${displayName} walked through ${placeName || "the palace"} today and found the most extraordinary things waiting at every turn. Timbuk was not even slightly surprised.`);
      setScrollPhase("revealed");
    }
  };

  const getMilestoneNudge = (day: number) => {
    if (day === 2) return "One more day and something interesting happens.";
    if (day === 3) return "Three days. The palace is starting to feel familiar.";
    if (day === 7) return "Seven days. Memory champions start somewhere. You started here.";
    if (day === 14) return "Two weeks. Your brain has been quietly rewiring itself.";
    if (day === 30) return "Thirty days. Timbuk has something special for you today.";
    return null;
  };

  const ScoreSummary = () => (
    <div className="flex items-center justify-center gap-8 py-4 px-6 bg-accent/40 rounded-2xl border border-border/50">
      <div className="text-center">
        <p className="text-4xl font-bold font-serif">
          {correctCount}
          <span className="text-lg text-muted-foreground ml-1">of {totalItems}</span>
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Today</p>
      </div>
      <div className="h-10 w-px bg-border" />
      <div className="text-center">
        <div className="flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-orange-500" />
          <p className="text-4xl font-bold font-serif">{streak}</p>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          {streak === 1 ? "Day" : "Days"}
        </p>
      </div>
    </div>
  );

  if (showConversion) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-md w-full mx-auto space-y-7">
          <ScoreSummary />

          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold leading-snug">
              Save your progress, {displayName} —
              <br />
              Day {nextDay} is waiting.
            </h1>
            <p className="text-muted-foreground text-base">
              Create a free account and we'll keep everything safe for you.
            </p>
          </div>

          {placeName && stops.length > 0 && (
            <div className="bg-background border border-border/60 rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Your Memory Palace
              </p>
              <p className="font-medium text-foreground capitalize">{placeName}</p>
              <ol className="space-y-0.5">
                {stops.map((stop, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary/60 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="capitalize">{stop}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {emailSent ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-foreground font-medium">Check your inbox!</p>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to finish saving your progress.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Don't see it? Check your junk or spam folder.</p>
            </div>
          ) : authMode === "choice" ? (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-3 text-base"
                onClick={handleGoogleAuth}
                disabled={loading}
                data-testid="button-google-auth"
              >
                <SiGoogle className="w-4 h-4" />
                Continue with Google
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-3 text-base"
                onClick={() => setAuthMode("email")}
                data-testid="button-email-auth"
              >
                Continue with Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 text-sm border-b border-border pb-3">
                <button
                  className={`flex-1 py-1 font-medium transition-colors ${isSignup ? "text-primary border-b-2 border-primary -mb-[13px]" : "text-muted-foreground"}`}
                  onClick={() => { setIsSignup(true); setAuthError(""); }}
                >
                  Create Account
                </button>
                <button
                  className={`flex-1 py-1 font-medium transition-colors ${!isSignup ? "text-primary border-b-2 border-primary -mb-[13px]" : "text-muted-foreground"}`}
                  onClick={() => { setIsSignup(false); setAuthError(""); }}
                >
                  Sign In
                </button>
              </div>
              <div className="space-y-3 pt-1">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button
                  size="lg"
                  className="w-full text-base"
                  onClick={handleEmailAuth}
                  disabled={loading || !email || !password}
                  data-testid="button-submit-email"
                >
                  {loading ? "Saving..." : isSignup ? "Create Account & Save Progress" : "Sign In & Save Progress"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => { setAuthMode("choice"); setAuthError(""); }}
                >
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {!emailSent && (
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Your first day is free. From Day 2 it's{" "}
              <span className="font-medium text-foreground">$8.99/month</span> — cancel anytime.{" "}
              <span className="line-through">$16.99/month</span>
            </p>
          )}

          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            onClick={onContinue}
            data-testid="button-skip-conversion"
          >
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  if (isGraduation) {
    return (
      <>
        {isPerfect && <Confetti />}
        <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center px-4 py-10">
          <div className="max-w-md w-full mx-auto space-y-8 text-center">
            <GraduationBadge name={displayName} onSave={() => setBadgeSaved(true)} />

            <div className="space-y-5">
              <p className="font-serif text-lg leading-relaxed text-foreground">
                {displayName}. Stop for a moment. Look what you did this week.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You built your first Memory Palace. Cleaned it. Walked it forward and backward. Used it for real life. Learned names.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Seven days ago you had never heard of a Memory Palace. Today you have one.
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">
                That is not nothing, {displayName}. That is actually extraordinary.
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-serif">{correctCount}<span className="text-sm text-muted-foreground ml-1">of {totalItems}</span></p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Today</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <p className="text-3xl font-bold font-serif">{streak}</p>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{streak === 1 ? "Day" : "Days"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground leading-relaxed">
                Wear it proudly. Rest that noggin this weekend. When you come back, we start Week 2.
              </p>
              <p className="font-serif text-foreground font-medium">
                Good memorizing, {displayName}. Over and out.
              </p>
            </div>

            {badgeSaved && (
              <p className="text-xs text-primary font-medium" data-testid="text-badge-saved">
                Badge saved to your downloads!
              </p>
            )}

            <Button
              size="lg"
              onClick={handleSeeYouTomorrow}
              className="gap-2 text-lg px-8 py-6 w-full sm:w-auto"
              data-testid="button-see-you-tomorrow"
            >
              <ArrowLeft className="w-5 h-5" />
              Start Week 2
            </Button>
          </div>
        </div>
      </>
    );
  }

  const recapItems = (assignments && assignments.length > 0)
    ? assignments
    : (pendingSession?.assignments && pendingSession.assignments.length > 0)
    ? pendingSession.assignments
    : [];

  const effectivePlaceName = placeName || pendingSession?.placeName;

  const proofCopy =
    correctCount === totalItems
      ? "Your palace held everything."
      : correctCount >= totalItems * 0.66
      ? "Your palace is working."
      : correctCount >= 1
      ? "The images are taking shape."
      : "You built a route. Tomorrow, we strengthen it.";

  const headline = (currentDay || 0) <= 1
    ? "You just built your first Memory Palace."
    : "You strengthened your Memory Palace.";

  const handleShare = () => {
    playSound("click");
    const shareText = `${displayName} just completed their Day ${currentDay || 1} memory walk with MemoryAmble — here's what Timbuk wrote them:\n\n"${scrollText}"\n\nThis is what 10 minutes a day looks like. MemoryAmble teaches the 2,000-year-old Memory Palace technique through a guided daily practice — built for seniors who want to stay sharp and have fun doing it.\n\n→ Try your first day free: memoryamble.com`;
    if (navigator.share) {
      navigator.share({ title: `${displayName}'s Memory Palace`, text: shareText }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(shareText).then(() => {
      setShareButtonText("Copied!");
      setTimeout(() => setShareButtonText("Share My Scroll"), 2000);
    }).catch(() => {});
  };

  return (
    <>
      {isPerfect && <Confetti />}

      {/* ── PAGE WRAPPER with backing plate ── */}
      <div
        className="relative min-h-dvh flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden"
        style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FAF7FF 40%, #FEF9F0 100%)" }}
      >
        {/* Layer 1 — backing plate image (hidden on mobile) */}
        <img
          src={terraceBg}
          alt=""
          aria-hidden="true"
          className="hidden sm:block"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center bottom",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Layer 2 — cream/lavender readability overlay */}
        <div
          className="hidden sm:block"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: "linear-gradient(160deg, rgba(245,240,255,0.88) 0%, rgba(250,247,255,0.84) 40%, rgba(254,249,240,0.88) 100%)",
          }}
        />

        {/* Layer 3 — main card content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-[1060px] mx-auto px-4 py-10 space-y-5"
          style={{ zIndex: 10 }}
        >
          {/* ── MAIN COMPLETION CARD ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E3F4",
              boxShadow: "0 6px 32px rgba(109,45,226,0.11)",
            }}
          >
            {/* Purple top accent */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #6D2DE2 0%, #A78BFA 100%)" }} />

            <div className="px-6 md:px-10 py-8 space-y-7">

              {/* ── CEREMONY HEADER ── */}
              <div className="text-center space-y-3">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                  style={{ backgroundColor: "#EDE9FE", color: "#6D2DE2" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Today's Walk Complete
                </div>
                {currentDay && currentDay > 0 && (
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#C4B5FD" }}>
                    Day {currentDay} complete
                  </p>
                )}
                <h1 className="font-serif text-2xl md:text-3xl font-semibold leading-snug" style={{ color: "#1A1028" }}>
                  {headline}
                </h1>
              </div>

              {/* ── SCORE PANEL ── */}
              <div
                className="rounded-2xl px-6 py-6 text-center space-y-2 max-w-xs mx-auto w-full"
                style={{ backgroundColor: "#F5F0FF", border: "1px solid #DDD5F8" }}
              >
                <p className="text-6xl font-bold font-serif" style={{ color: "#1A1028" }}>
                  {correctCount}
                  <span className="text-2xl font-normal ml-2" style={{ color: "#9C8BB4" }}>of {totalItems}</span>
                </p>
                <p className="text-sm font-medium uppercase tracking-widest" style={{ color: "#9C8BB4" }}>
                  items remembered
                </p>
                <p className="text-base mt-1" style={{ color: "#3D2E6E" }}>
                  {proofCopy}
                </p>
              </div>

              {/* ── PROOF STATEMENT ── */}
              <div className="text-center space-y-1">
                <p className="font-serif text-lg md:text-xl" style={{ color: "#3D2E6E" }}>
                  You didn't memorize a list. You walked a route.
                </p>
                <p className="text-sm font-medium" style={{ color: "#9C8BB4" }}>
                  That is the Memory Palace working.
                </p>
              </div>

              {/* ── STREAK STRIP ── */}
              {streak > 0 && (
                <div>
                  <div
                    className="flex items-center justify-center gap-3 rounded-xl px-5 py-3"
                    style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
                  >
                    <Flame className="w-5 h-5 flex-shrink-0" style={{ color: "#C2540A" }} />
                    <p className="text-sm font-semibold" style={{ color: "#92400E" }}>
                      {streak === 1 ? "First day of your streak." : `${streak} days in a row.`}
                    </p>
                  </div>
                  {getMilestoneNudge(currentDay || 0) && (
                    <p className="text-center text-sm font-medium italic mt-2" style={{ color: "#6D2DE2" }}>
                      {getMilestoneNudge(currentDay || 0)}
                    </p>
                  )}
                </div>
              )}

              {/* ── ROUTE + SCROLL (two-column on desktop) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

                {/* LEFT — Route recap */}
                <div className="space-y-3">
                  {recapItems.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4" style={{ color: "#9C8BB4" }} />
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9C8BB4" }}>
                          Your route through {effectivePlaceName ? effectivePlaceName.replace(/^my /i, "") : "your palace"}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        {recapItems.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                            style={{ backgroundColor: "#FAFAFE", border: "1px solid #EDE9FA" }}
                          >
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: "#EDE9FE", color: "#6D2DE2" }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm" style={{ color: "#5B4B8A" }}>
                              <span className="font-medium">{item.stopName}</span>
                              {item.object && (
                                <>
                                  <span style={{ color: "#C4B5FD" }}> — </span>
                                  <span style={{ color: "#6D2DE2" }} className="font-semibold">
                                    {item.object.charAt(0).toUpperCase() + item.object.slice(1)}
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs italic" style={{ color: "#C4B5FD" }}>
                        The images were waiting where you placed them.
                      </p>
                    </>
                  ) : (
                    <div
                      className="rounded-2xl px-5 py-8 text-center"
                      style={{ backgroundColor: "#FAFAFE", border: "1px solid #EDE9FA" }}
                    >
                      <p className="text-sm" style={{ color: "#C4B5FD" }}>
                        Your route will appear here after today's walk.
                      </p>
                    </div>
                  )}
                </div>

                {/* RIGHT — Amble Scroll */}
                <div>
                  {scrollPhase === "prompt" && (
                    <div
                      className="rounded-2xl p-6 space-y-4 text-center"
                      style={{
                        background: "linear-gradient(135deg, #fef9f0 0%, #fdf3e0 100%)",
                        border: "1px solid #e9d09a",
                        boxShadow: "0 2px 12px rgba(180,140,80,0.10)",
                      }}
                    >
                      <img src={timbukAvatar} alt="Timbuk" className="w-12 h-12 rounded-full mx-auto" />
                      <div>
                        <p className="font-serif text-sm font-semibold" style={{ color: "#92400E" }}>
                          The Amble Scroll of {displayName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
                          {effectivePlaceName || "Your Palace"} — Day {currentDay || 1}
                        </p>
                      </div>
                      <p className="font-serif text-base leading-relaxed" style={{ color: "#78350F" }}>
                        Remember the gift I mentioned? Here it is.
                      </p>
                      <Button
                        size="sm"
                        onClick={handleShowScroll}
                        className="gap-2"
                        data-testid="button-show-scroll"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Show My Scroll
                      </Button>
                    </div>
                  )}

                  {scrollPhase === "loading" && (
                    <div
                      className="rounded-2xl p-6 space-y-3 text-center"
                      style={{
                        background: "linear-gradient(135deg, #fef9f0 0%, #fdf3e0 100%)",
                        border: "1px solid #e9d09a",
                        boxShadow: "0 2px 12px rgba(180,140,80,0.10)",
                      }}
                    >
                      <img src={timbukAvatar} alt="Timbuk" className="w-12 h-12 rounded-full mx-auto" style={{ animation: "pulse 2s ease-in-out infinite" }} />
                      <p className="font-serif text-base font-medium" style={{ color: "#78350F" }}>
                        Timbuk is writing your scroll...
                      </p>
                      <p className="text-sm italic" style={{ color: "#B45309" }}>
                        He takes these seriously.
                      </p>
                    </div>
                  )}

                  {scrollPhase === "revealed" && (
                    <div
                      className="rounded-2xl p-5 md:p-6 space-y-4"
                      style={{
                        background: "linear-gradient(135deg, #fef9f0 0%, #fdf3e0 50%, #fef9f0 100%)",
                        border: "1px solid #e9d09a",
                        boxShadow: "0 4px 24px rgba(180,140,80,0.12)",
                      }}
                      data-testid="amble-scroll-card"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "rgba(233,208,154,0.6)" }}>
                        <img src={timbukAvatar} alt="Timbuk" className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div>
                          <p className="font-serif text-sm font-semibold" style={{ color: "#92400E" }}>
                            The Amble Scroll of {displayName}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(180,83,9,0.7)" }}>
                            {effectivePlaceName || "Your Palace"} — Day {currentDay || 1}
                          </p>
                        </div>
                      </div>
                      <p className="font-serif text-base md:text-lg leading-relaxed" style={{ color: "#451A03" }}>
                        {scrollText}
                      </p>
                      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(233,208,154,0.6)" }}>
                        <p className="text-xs" style={{ color: "rgba(180,83,9,0.6)" }}>Built with Timbuk</p>
                        <p className="text-xs" style={{ color: "rgba(180,83,9,0.6)" }}>MemoryAmble.com</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CTA BUTTONS ── */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {scrollPhase === "revealed" && (
                    <Button
                      size="lg"
                      onClick={handleShare}
                      className="w-full sm:w-auto gap-2 px-8"
                      data-testid="button-share-scroll"
                    >
                      <Share2 className="w-4 h-4" />
                      {shareButtonText}
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant={scrollPhase === "revealed" ? "outline" : "default"}
                    onClick={handleSeeYouTomorrow}
                    className="w-full sm:w-auto gap-2 px-8"
                    data-testid="button-see-you-tomorrow"
                  >
                    See You Tomorrow
                  </Button>
                </div>
                {scrollPhase === "revealed" && (
                  <p className="text-center text-xs" style={{ color: "#C4B5FD" }}>
                    Your scroll is yours. We don't post anything without your tap.
                  </p>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
