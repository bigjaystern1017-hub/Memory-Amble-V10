import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

const CHUNK_DELAY_MS = 55;
const CHUNK_DURATION_MS = 340;

function buildChunks(text: string): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const size = words.length > 20 ? 4 : words.length > 10 ? 3 : 2;
  const result: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    result.push(words.slice(i, i + size).join(" "));
  }
  return result;
}

function SoftRevealText({
  text,
  onDone,
  fastForward,
}: {
  text: string;
  onDone?: () => void;
  fastForward?: boolean;
}) {
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const containerRef = useRef<HTMLParagraphElement>(null);

  const [revealed, setRevealed] = useState(() => !!fastForward);

  const chunks = useMemo(() => buildChunks(text), [text]);

  useEffect(() => {
    if (doneRef.current) return;

    if (fastForward) {
      doneRef.current = true;
      setRevealed(true);
      onDoneRef.current?.();
      return;
    }

    const totalMs = (chunks.length - 1) * CHUNK_DELAY_MS + CHUNK_DURATION_MS + 100;
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
    }, totalMs);
    return () => clearTimeout(t);
  }, [fastForward, chunks.length]);

  useEffect(() => {
    if (revealed) return;
    const scrollEl = () => {
      if (containerRef.current) {
        const el = containerRef.current.closest("[data-testid='chat-scroll']");
        if (el) el.scrollTop = el.scrollHeight;
      }
    };
    scrollEl();
    const interval = setInterval(scrollEl, 120);
    const totalMs = (chunks.length - 1) * CHUNK_DELAY_MS + CHUNK_DURATION_MS + 200;
    const stopper = setTimeout(() => clearInterval(interval), totalMs);
    return () => {
      clearInterval(interval);
      clearTimeout(stopper);
    };
  }, [revealed, chunks.length]);

  if (revealed) {
    return (
      <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return (
    <p
      ref={containerRef}
      className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap"
    >
      {chunks.map((chunk, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: CHUNK_DURATION_MS / 1000,
            delay: (i * CHUNK_DELAY_MS) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: "inline" }}
        >
          {i > 0 ? " " : ""}
          {chunk}
        </motion.span>
      ))}
    </p>
  );
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

  if (isTimbuk) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex gap-4 justify-start${!isLatest ? " opacity-30 scale-[0.98] transition-all duration-500" : ""}`}
        data-testid={`message-${sender}`}
      >
        {/* Avatar — sits outside the card */}
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
          className={`relative flex-1 max-w-[88%] md:max-w-[82%] rounded-2xl px-6 py-5 flex flex-col gap-2 ${
            isWisdom ? "italic" : ""
          }`}
          style={{
            backgroundColor: isWisdom ? "#F9F6FF" : "#FFFFFF",
            border: isWisdom ? "1px solid #E2D9F3" : "1px solid #E8E3F4",
            boxShadow: "0 2px 12px rgba(109,45,226,0.07)",
          }}
        >
          {/* Skip link top-right */}
          {onSkipTyping && (
            <button
              onClick={onSkipTyping}
              className="absolute top-4 right-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-skip-typing"
            >
              Skip
            </button>
          )}

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
          ) : typewriter ? (
            <div className={isWisdom ? "italic" : ""}>
              <SoftRevealText
                text={text}
                onDone={onTypewriterDone}
                fastForward={fastForward}
              />
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
        style={{
          backgroundColor: "#6D2DE2",
          color: "#fff",
        }}
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
