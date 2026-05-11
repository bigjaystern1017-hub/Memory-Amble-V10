import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { User } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

const REVEAL_DURATION = 1.05;
const SHIMMER_DURATION = 1.3;
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

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
  const isTimbuk = sender === "timbuk";
  const isWisdom = variant === "wisdom";
  const prefersReducedMotion = useReducedMotion();

  const doneRef = useRef(false);
  const onDoneRef = useRef(onTypewriterDone);
  onDoneRef.current = onTypewriterDone;

  useEffect(() => {
    if (!isTimbuk || !typewriter) return;
    if (doneRef.current) return;

    if (fastForward || prefersReducedMotion) {
      doneRef.current = true;
      onDoneRef.current?.();
      return;
    }

    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
    }, (REVEAL_DURATION + 0.15) * 1000);

    return () => clearTimeout(t);
  }, [fastForward, isTimbuk, typewriter, prefersReducedMotion]);

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
          <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
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

  const isReveal = typewriter && !fastForward && !prefersReducedMotion;

  const outerInitial = isReveal
    ? { opacity: 0, x: -18, y: 6, filter: "blur(8px)", scale: 0.985 }
    : { opacity: 0, y: 14 };

  const outerAnimate = { opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 };

  const outerTransition = isReveal
    ? { duration: REVEAL_DURATION, ease: REVEAL_EASE }
    : { duration: 0.3, ease: "easeOut" };

  return (
    <motion.div
      initial={outerInitial}
      animate={outerAnimate}
      transition={outerTransition}
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

        {/* Shimmer sweep — only during card reveal, never when fast-forwarding */}
        {isReveal && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ x: "-110%" }}
            animate={{ x: "115%" }}
            transition={{ duration: SHIMMER_DURATION, ease: REVEAL_EASE }}
            style={{
              background:
                "linear-gradient(100deg, transparent 0%, rgba(255,252,248,0.42) 48%, rgba(237,233,254,0.22) 55%, transparent 100%)",
            }}
          />
        )}

        {/* Text content */}
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
          <p
            className={`text-xl md:text-2xl leading-relaxed whitespace-pre-wrap${
              isWisdom ? " italic text-muted-foreground" : ""
            }`}
          >
            {text}
          </p>
        )}
      </div>
    </motion.div>
  );
}
