import { useState, useRef, useEffect } from "react";
import { Trophy, Flame, ArrowLeft, Eye, EyeOff, Download } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

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
}: AmbleResultsProps) {
  const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const isPerfect = totalItems > 0 && correctCount === totalItems;
  const isGraduation = currentDay === 7 && correctCount >= totalItems * 0.8;

  const [showConversion, setShowConversion] = useState(false);
  const [authMode, setAuthMode] = useState<"choice" | "email">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [badgeSaved, setBadgeSaved] = useState(false);

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

  return (
    <>
      {isPerfect && <Confetti />}
      <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center px-4 py-8 safe-area-inset">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
              Session Complete!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Your Memory Palace is thriving.
            </p>
          </div>

          <div className="bg-background border border-primary/20 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                Today's Performance
              </p>
              <p className="text-5xl md:text-6xl font-bold font-serif">
                {correctCount}
                <span className="text-xl md:text-2xl text-muted-foreground ml-2">
                  of {totalItems}
                </span>
              </p>
              <p className="text-lg text-muted-foreground">
                You remembered {correctCount} out of {totalItems} items today!
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">
                  {streak} {streak === 1 ? "Day" : "Days"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              {percentage === 100
                ? "A perfect walk! Your palace is rock solid."
                : percentage >= 66
                ? "That's genuinely impressive. Your palace is working beautifully."
                : percentage >= 33
                ? "Good work today. The pictures are taking shape."
                : "You built a palace and walked through it. That's a real start."}
            </p>

            <p className="text-sm text-muted-foreground">
              Walk through your palace one more time tonight — the images will get even stickier.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleSeeYouTomorrow}
            className="gap-2 text-lg px-8 py-6 w-full sm:w-auto"
            data-testid="button-see-you-tomorrow"
          >
            <ArrowLeft className="w-5 h-5" />
            See You Tomorrow
          </Button>
        </div>
      </div>
    </>
  );
}
