import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { User } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

// Timing constants
const CARD_DURATION    = 1.35;  // card entrance (blur + x + scale)
const TEXT_DURATION    = 1.55;  // text opacity + blur fade-in
const SHIMMER_DURATION = 1.85;  // diagonal ripple sweep
const DONE_DELAY_MS    = 1700;  // when onDone fires (ms)
const REDUCED_DONE_MS  = 280;   // when onDone fires under reduced-motion
const EASE             = [0.16, 1, 0.3, 1] as const;

// Diagonal repeating-gradient: fine silk/satin lines at ~105°
const RIPPLE_GRADIENT =
  "repeating-linear-gradient(105deg, transparent 0px, rgba(255,252,248,0.30) 9px, rgba(237,233,254,0.18) 14px, transparent 23px)";

interface ChatMessageProps {
  sender: "timbuk" | "gladys";
  text: string;
  isTyping?: boolean;
  typewriter?: boolean;
  onTypewriterDone?: () => void;
  fastForward?: boolean;
  onSkipTyping?: () => void;
  variant?: "wisdom";
  isLatest?: boolean;
}

export function ChatMessage({
  sender,
  text,
  isTyping,
  typewriter,
  onTypewriterDone,
  fastForward,
  onSkipTyping,
  variant,
  isLatest = true,
}: ChatMessageProps) {
  const isTimbuk        = sender === "timbuk";
  const isWisdom        = variant === "wisdom";
  const reducedMotion   = useReducedMotion();

  // ─── onDone management ───────────────────────────────────────────────────
  const doneRef   = useRef(false);
  const onDoneRef = useRef(onTypewriterDone);
  onDoneRef.current = onTypewriterDone;

  useEffect(() => {
    if (!isTimbuk || !typewriter) return;
    if (doneRef.current) return;

    const instant = fastForward || reducedMotion;
    const delay   = instant ? 0 : DONE_DELAY_MS;

    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
    }, delay);

    return () => clearTimeout(t);
  }, [fastForward, isTimbuk, typewriter, reducedMotion]);

  // ─── User (Gladys) bubble ────────────────────────────────────────────────
  if (!isTimbuk) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex gap-3 justify-end${!isLatest ? " opacity-30 scale-[0.98] transition-all duration-500" : ""}`}
        data-testid={`message-${sender}`}
      >
        <div
          className="max-w-[75%] md:max-w-[65%] rounded-2xl px-5 py-4"
          style={{ backgroundColor: "#6D2DE2", color: "#fff" }}
        >
          <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1"
          style={{ backgroundColor: "#EDE9FE" }}
        >
          <User className="w-5 h-5" style={{ color: "#6D2DE2" }} />
        </div>
      </motion.div>
    );
  }

  // ─── Reveal mode: is this a typewriter-style Timbuk message? ─────────────
  const isReveal = typewriter && !fastForward && !reducedMotion;

  // Card entrance animation values
  const cardInit = isReveal
    ? { opacity: 0, x: -20, y: 8, filter: "blur(10px)", scale: 0.985 }
    : reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 14 };

  const cardAnimate  = { opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 };
  const cardDuration = isReveal ? CARD_DURATION : reducedMotion ? 0.25 : 0.3;
  const cardEase     = isReveal ? EASE : ("easeOut" as const);

  // Text content animation (whole block — not per word)
  const textInit = isReveal
    ? { opacity: 0, filter: "blur(5px)" }
    : { opacity: 1, filter: "blur(0px)" };

  const textAnimate  = { opacity: 1, filter: "blur(0px)" };
  const textDuration = isReveal ? TEXT_DURATION : 0;

  return (
    <motion.div
      initial={cardInit}
      animate={cardAnimate}
      transition={{ duration: cardDuration, ease: cardEase }}
      className={`flex gap-4 justify-start${!isLatest ? " opacity-30 scale-[0.98] transition-all duration-500" : ""}`}
      data-testid={`message-${sender}`}
    >
      {/* Avatar */}
      <div
        className="shrink-0 mt-1 rounded-full overflow-hidden border-2 border-white shadow-sm"
        style={{ width: 56, height: 56, minWidth: 56 }}
      >
        <img
          src={timbukAvatarPath}
          alt="Timbuk"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative flex-1 max-w-[88%] md:max-w-[82%] rounded-2xl px-6 py-5 flex flex-col gap-2 overflow-hidden${
          isWisdom ? " italic" : ""
        }`}
        style={{
          backgroundColor: isWisdom ? "#F9F6FF" : "#FFFFFF",
          border: isWisdom ? "1px solid #E2D9F3" : "1px solid #E8E3F4",
          boxShadow: "0 2px 12px rgba(109,45,226,0.07)",
        }}
      >
        {/* Skip button */}
        {onSkipTyping && (
          <button
            onClick={onSkipTyping}
            className="absolute top-4 right-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors z-10"
            data-testid="button-skip-typing"
          >
            Skip
          </button>
        )}

        {/* ── Diagonal ripple shimmer — sweeps left to right ── */}
        {isReveal && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ x: "-130%", opacity: 1 }}
            animate={{ x: "130%", opacity: 0 }}
            transition={{ duration: SHIMMER_DURATION, ease: EASE }}
            style={{
              background: RIPPLE_GRADIENT,
              width: "200%",
              left: "-50%",
            }}
          />
        )}

        {/* ── Text content ── */}
        {isTyping ? (
          <div className="flex items-center gap-1.5 py-1">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-muted-foreground/50"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
              />
            ))}
          </div>
        ) : (
          <motion.p
            className={`text-base md:text-2xl leading-relaxed whitespace-pre-wrap${
              isWisdom ? " italic text-muted-foreground" : ""
            }`}
            initial={textInit}
            animate={textAnimate}
            transition={{ duration: textDuration, ease: EASE }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
