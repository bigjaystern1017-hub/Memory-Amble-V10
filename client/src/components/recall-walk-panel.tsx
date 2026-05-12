import { CheckCircle2, Footprints } from "lucide-react";

export type RecallWalkPanelProps = {
  placeName?: string;
  stops?: string[];
  currentRecallIndex?: number;
  userAnswers?: string[];
  totalItems?: number;
};

export function RecallWalkPanel({
  placeName,
  stops = [],
  currentRecallIndex = 0,
  userAnswers = [],
  totalItems,
}: RecallWalkPanelProps) {
  const count = totalItems ?? stops.length;
  const hasStops = stops.length > 0;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "#FFF8E7",
        border: "1px solid #D4A843",
        boxShadow: "0 2px 14px rgba(212,168,67,0.12)",
      }}
    >
      {/* Amber/gold top accent */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #D4A843 0%, #F5C842 100%)" }}
      />

      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#EDD98A" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Footprints className="w-4 h-4" style={{ color: "#8B6914" }} />
          <h3 className="font-semibold text-sm" style={{ color: "#1A1028" }}>Walk It Back</h3>
        </div>
        <p className="text-xs" style={{ color: "#9C8BB4" }}>
          Visit each stop in your mind. What do you see?
        </p>

        {/* Instruction pill */}
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#FFF3D4", color: "#8B6914" }}
        >
          Don't memorize. Walk.
        </div>

        {placeName && (
          <div
            className="mt-2 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ backgroundColor: "#F5F0FF", color: "#6D2DE2" }}
          >
            {placeName.charAt(0).toUpperCase() + placeName.slice(1).replace(/^my /i, "Your ")}
          </div>
        )}

        {count > 0 && (
          <p className="mt-2 text-xs" style={{ color: "#C4A44A" }}>
            Stop {Math.min(currentRecallIndex + 1, count)} of {count}
          </p>
        )}
      </div>

      {/* Stop list */}
      <div className="px-5 py-4">
        {!hasStops ? (
          <p className="text-xs leading-relaxed text-center py-4" style={{ color: "#C4A44A" }}>
            Your recall walk will appear here once your route is ready.
          </p>
        ) : (
          <div className="space-y-2">
            {stops.slice(0, count || stops.length).map((stop, i) => {
              const isActive = i === currentRecallIndex;
              const isDone = i < currentRecallIndex || (userAnswers[i] && i <= currentRecallIndex);
              const hasAnswer = !!userAnswers[i];

              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl px-3 py-3 transition-all duration-200"
                  style={
                    isActive
                      ? { backgroundColor: "#FFF3D4", border: "1px solid #D4A843" }
                      : isDone
                      ? { backgroundColor: "#FAFAFE", border: "1px solid #EDE9FA" }
                      : { backgroundColor: "#FAFAF5", border: "1px solid #EDE9D0" }
                  }
                >
                  {/* Circle */}
                  <div className="shrink-0 mt-0.5">
                    {hasAnswer && !isActive ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#ECFDF5" }}
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: "#059669" }} />
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={
                          isActive
                            ? { backgroundColor: "#8B6914", color: "#fff" }
                            : { backgroundColor: "#EDE9D4", color: "#B8A06A" }
                        }
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium"
                      style={{ color: isActive ? "#1A1028" : isDone ? "#3D2E6E" : "#A09060" }}
                    >
                      {stop}
                    </span>
                    {isActive && (
                      <p className="text-xs mt-0.5 font-semibold" style={{ color: "#8B6914" }}>
                        You are here
                      </p>
                    )}
                    {hasAnswer && !isActive && (
                      <p className="text-xs mt-0.5 font-medium" style={{ color: "#059669" }}>
                        Answered
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
