import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

const CHAR_DELAY_MS = 55;

function charDelay(ch: string): number {
  if (ch === "?" || ch === "!") return CHAR_DELAY_MS + 250;
  if (ch === "." || ch === "," || ch === "-") return CHAR_DELAY_MS + 180;
  return CHAR_DELAY_MS;
}

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

function TypewriterText({ text, onDone, fastForward }: { text: string; onDone?: () => void; fastForward?: boolean }) {
  const [charIndex, setCharIndex] = useState(0);
  const doneRef = useRef(false);
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (fastForward && !doneRef.current) {
      doneRef.current = true;
      setCharIndex(text.length);
      onDone?.();
      return;
    }

    if (charIndex >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, charDelay(text[charIndex]));

    return () => clearTimeout(timer);
  }, [charIndex, text.length, onDone, fastForward, text]);

  useEffect(() => {
    if (fastForward || charIndex % 5 === 0) {
      if (containerRef.current) {
        const el = containerRef.current.closest("[data-testid='chat-scroll']");
        if (el) {
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
          });
        }
      }
    }
  }, [charIndex, fastForward]);

  return (
    <p ref={containerRef} className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
      {text.slice(0, charIndex)}
      {charIndex < text.length && (
        <span className="inline-block w-0.5 h-5 md:h-6 bg-foreground/40 animate-pulse ml-0.5 align-text-bottom" />
      )}
    </p>
  );
}

export function ChatMessage({ sender, text, isTyping, typewriter, onTypewriterDone, fastForward, onSkipTyping, variant, isLatest = true }: ChatMessageProps) {
  const isTimbuk = sender === "timbuk";
  const isWisdom = variant === "wisdom";

  if (isTimbuk) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex gap-4 justify-start${!isLatest ? " opacity-30 scale-[0.98] transition-all duration-500" : ""}`}
        data-testid={`message-${sender}`}
      >
        {/* Avatar — slightly outside card */}
        <div
          className="shrink-0 mt-2 rounded-full overflow-hidden shadow-sm"
          style={{ width: 56, height: 56 }}
        >
          <img src={timbukAvatarPath} alt="Timbuk" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Card */}
        <div
          className={`relative flex-1 max-w-[85%] md:max-w-[680px] rounded-2xl px-6 py-5 flex flex-col gap-2 shadow-sm border ${
            isWisdom
              ? "bg-amber-50/80 border-amber-200/60 text-amber-900"
              : "bg-white border-stone-200/80"
          }`}
        >
          {/* Skip link — top right */}
          {onSkipTyping && !isTyping && (
            <button
              onClick={onSkipTyping}
              className="absolute top-3 right-4 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
              data-testid="button-skip-typing"
            >
              Skip
            </button>
          )}

          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-stone-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-stone-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-stone-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : typewriter ? (
            <div className={isWisdom ? "italic" : ""}>
              <TypewriterText text={text} onDone={onTypewriterDone} fastForward={fastForward} />
            </div>
          ) : (
            <p className={`text-xl md:text-2xl leading-relaxed whitespace-pre-wrap${isWisdom ? " italic" : ""}`}>{text}</p>
          )}
        </div>
      </motion.div>
    );
  }

  // User message
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 justify-end${!isLatest ? " opacity-30 scale-[0.98] transition-all duration-500" : ""}`}
      data-testid={`message-${sender}`}
    >
      <div className="max-w-[75%] md:max-w-[560px] rounded-2xl px-5 py-4 bg-[#6D2DE2] text-white shadow-sm shadow-purple-200">
        <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-1">
        <User className="w-5 h-5 text-stone-500" />
      </div>
    </motion.div>
  );
}
