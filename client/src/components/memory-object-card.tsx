import { Sparkles, MapPin, Eye, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type MemoryObjectCardMode = "placing" | "planted" | "recalling" | "idle";

export type MemoryObjectCardProps = {
  objectName?: string;
  stopName?: string;
  sceneText?: string;
  stepIndex?: number;
  totalItems?: number;
  mode?: MemoryObjectCardMode;
};

const PILL_CONFIG = {
  placing: { bg: "#F0EBFF", color: "#6D2DE2", icon: Sparkles, label: "Plant this image" },
  planted: { bg: "#ECFDF5", color: "#059669", icon: Eye, label: "Image planted" },
  recalling: { bg: "#FFF7ED", color: "#C2540A", icon: Eye, label: "Walk it back" },
  idle: { bg: "#F5F0FF", color: "#9C8BB4", icon: Package, label: "Up next" },
};

export function MemoryObjectCard({
  objectName,
  stopName,
  sceneText,
  stepIndex = 0,
  totalItems = 0,
  mode = "idle",
}: MemoryObjectCardProps) {
  const cfg = PILL_CONFIG[mode];
  const PillIcon = cfg.icon;
  const countLabel = totalItems > 0 ? `Object ${stepIndex + 1} of ${totalItems}` : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${stepIndex}-${mode}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E3F4",
          boxShadow: "0 2px 14px rgba(109,45,226,0.08)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              mode === "placed" || mode === "planted"
                ? "linear-gradient(90deg, #059669 0%, #34D399 100%)"
                : mode === "recalling"
                ? "linear-gradient(90deg, #C2540A 0%, #FB923C 100%)"
                : "linear-gradient(90deg, #6D2DE2 0%, #A78BFA 100%)",
          }}
        />

        <div className="px-5 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              <PillIcon className="w-3 h-3" />
              {cfg.label}
            </div>
            {countLabel && (
              <span className="text-xs font-medium" style={{ color: "#C4B5FD" }}>
                {countLabel}
              </span>
            )}
          </div>

          {/* Main content */}
          {mode === "recalling" ? (
            <div className="space-y-2">
              {stopName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: "#C2540A" }} />
                  <span className="text-base font-semibold" style={{ color: "#1A1028" }}>
                    {stopName}
                  </span>
                </div>
              )}
              <p className="text-sm" style={{ color: "#9C8BB4" }}>
                Walk to this stop in your mind. What object is waiting there?
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {objectName ? (
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: "#1A1028", fontFamily: "Lora, Georgia, serif" }}>
                  {objectName.charAt(0).toUpperCase() + objectName.slice(1)}
                </h3>
              ) : (
                <p className="text-sm italic" style={{ color: "#C4B5FD" }}>
                  Timbuk will give you an object to plant here.
                </p>
              )}

              {stopName && objectName && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#9C8BB4" }} />
                  <span className="text-sm" style={{ color: "#6D2DE2" }}>
                    {stopName}
                  </span>
                </div>
              )}

              {mode === "placing" && objectName && (
                <p className="text-xs mt-1" style={{ color: "#B8A9D4" }}>
                  Make it strange, vivid, and personal.
                </p>
              )}

              {mode === "planted" && sceneText && (
                <div
                  className="mt-3 px-4 py-3 rounded-xl text-sm italic leading-relaxed"
                  style={{ backgroundColor: "#F5F0FF", color: "#5B21B6", borderLeft: "3px solid #C4B5FD" }}
                >
                  "{sceneText}"
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
