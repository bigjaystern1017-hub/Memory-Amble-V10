import { useState } from "react";

const MODIFIER_POOL = [
  { emoji: "🔥", label: "on fire" },
  { emoji: "😢", label: "sad" },
  { emoji: "😍", label: "in love" },
  { emoji: "🤪", label: "silly" },
  { emoji: "👑", label: "royal" },
  { emoji: "🎩", label: "fancy" },
  { emoji: "💪", label: "strong" },
  { emoji: "🎵", label: "singing" },
  { emoji: "😴", label: "sleeping" },
  { emoji: "🤯", label: "mind-blown" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getModifiers(object: string) {
  const start = hashString(object) % MODIFIER_POOL.length;
  return [0, 1, 2].map((i) => MODIFIER_POOL[(start + i) % MODIFIER_POOL.length]);
}

interface PlacementCardProps {
  object: string;
  objectEmoji: string;
  stopName: string;
  onPlace: (modifier: string) => void;
}

export default function PlacementCard({
  object,
  objectEmoji,
  stopName,
  onPlace,
}: PlacementCardProps) {
  const [selectedModifier, setSelectedModifier] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const modifiers = getModifiers(object);

  const handleModifierTap = (modifier: { emoji: string; label: string }) => {
    if (isAnimating) return;
    setSelectedModifier(modifier.emoji);
    setIsAnimating(true);
    setTimeout(() => {
      onPlace(modifier.emoji);
    }, 500);
  };

  return (
    <div
      className="flex flex-col items-center gap-5 px-6 py-8 bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-xs mx-auto"
      style={{ animation: "fadeIn 300ms ease forwards" }}
    >
      <div className="text-sm text-gray-400 font-serif text-center">{stopName}</div>

      <div className="flex flex-col items-center gap-2">
        <div
          className="transition-transform duration-300"
          style={{
            fontSize: 64,
            lineHeight: 1,
            transform: selectedModifier ? "scale(1.15)" : "scale(1)",
          }}
        >
          {selectedModifier ? (
            <span>
              {objectEmoji}
              <span
                style={{
                  display: "inline-block",
                  animation: "popIn 300ms ease forwards",
                  marginLeft: 4,
                }}
              >
                {selectedModifier}
              </span>
            </span>
          ) : (
            objectEmoji
          )}
        </div>
        <div className="text-xl font-bold text-gray-800 capitalize">{object}</div>
      </div>

      <div className="flex gap-3">
        {modifiers.map((mod) => (
          <button
            key={mod.emoji}
            className={`
              flex items-center justify-center rounded-xl bg-white border-2 transition-all text-2xl
              ${selectedModifier === mod.emoji
                ? "border-purple-500 scale-110 shadow-md"
                : "border-purple-200 hover:border-purple-400"}
            `}
            style={{ width: 60, height: 60 }}
            onClick={() => handleModifierTap(mod)}
            disabled={isAnimating}
            title={mod.label}
          >
            {mod.emoji}
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-400">Tap to make it memorable</div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
