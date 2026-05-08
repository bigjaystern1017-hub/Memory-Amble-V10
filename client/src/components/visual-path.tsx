import { useRef, useEffect } from "react";

interface Stop {
  name: string;
  object?: string;
  modifier?: string;
  revealed?: boolean;
  correct?: boolean;
}

interface VisualPathProps {
  stops: Stop[];
  currentStopIndex: number;
  phase: "placement" | "recall" | "results";
  pathColor?: string;
  onStopClick?: (index: number) => void;
}

export default function VisualPath({
  stops,
  currentStopIndex,
  phase,
  pathColor = "#7C3AED",
  onStopClick,
}: VisualPathProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStopIndex]);

  const isVisited = (index: number) => index <= currentStopIndex;
  const isCurrent = (index: number) => index === currentStopIndex;

  return (
    <div className="relative w-full overflow-y-auto py-6 px-2" style={{ maxHeight: "100%" }}>
      {stops.map((stop, index) => {
        const visited = isVisited(index);
        const current = isCurrent(index);
        const isLast = index === stops.length - 1;

        return (
          <div key={index} className="relative flex items-start" style={{ minHeight: 90 }}>
            {/* Vertical line segment above circle */}
            {index > 0 && (
              <div
                className="absolute"
                style={{
                  left: "calc(20% - 1.5px)",
                  top: 0,
                  width: 3,
                  height: 36,
                  background: visited
                    ? pathColor
                    : "repeating-linear-gradient(to bottom, #d1d5db 0px, #d1d5db 6px, transparent 6px, transparent 12px)",
                }}
              />
            )}

            {/* Circle on path */}
            <div
              className="absolute flex items-center justify-center rounded-full z-10 transition-all duration-300"
              style={{
                left: "calc(20% - 12px)",
                top: 30,
                width: 24,
                height: 24,
                backgroundColor: visited ? pathColor : "#e5e7eb",
                border: current ? `3px solid ${pathColor}` : "3px solid transparent",
                boxShadow: current ? `0 0 0 3px ${pathColor}33` : "none",
              }}
            >
              {visited && !current && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="3" fill="white" />
                </svg>
              )}
              {current && (
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "white" }}
                />
              )}
            </div>

            {/* Vertical line segment below circle (to next stop) */}
            {!isLast && (
              <div
                className="absolute"
                style={{
                  left: "calc(20% - 1.5px)",
                  top: 54,
                  width: 3,
                  bottom: 0,
                  background:
                    index < currentStopIndex
                      ? pathColor
                      : "repeating-linear-gradient(to bottom, #d1d5db 0px, #d1d5db 6px, transparent 6px, transparent 12px)",
                }}
              />
            )}

            {/* Short horizontal connector */}
            <div
              className="absolute"
              style={{
                left: "calc(20% + 12px)",
                top: 40,
                width: 20,
                height: 2,
                backgroundColor: visited ? pathColor : "#e5e7eb",
              }}
            />

            {/* Stop card */}
            <div
              ref={current ? currentRef : undefined}
              className={`
                bg-white rounded-xl border-2 p-4 shadow-sm transition-all duration-300 cursor-pointer
                ${current ? "scale-105 shadow-md" : ""}
              `}
              style={{
                marginLeft: "calc(20% + 36px)",
                marginTop: 18,
                marginBottom: 18,
                minWidth: 200,
                flex: 1,
                borderColor: current ? pathColor : "#e5e7eb",
                animation: current ? "pulse-border 2s infinite" : "none",
              }}
              onClick={() => onStopClick?.(index)}
            >
              <StopCardContent
                stop={stop}
                phase={phase}
                visited={visited}
                current={current}
                pathColor={pathColor}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 ${pathColor}33; }
          50% { box-shadow: 0 0 0 6px ${pathColor}11; }
        }
      `}</style>
    </div>
  );
}

function StopCardContent({
  stop,
  phase,
  visited,
  current,
  pathColor,
}: {
  stop: Stop;
  phase: "placement" | "recall" | "results";
  visited: boolean;
  current: boolean;
  pathColor: string;
}) {
  if (phase === "placement") {
    return (
      <div>
        <div className="text-sm text-gray-500 font-medium mb-1">{stop.name}</div>
        {stop.object ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{stop.modifier ? `${stop.modifier} ` : ""}{stop.object}</span>
          </div>
        ) : current ? (
          <div className="text-xs text-purple-400 italic animate-pulse">Placing item here...</div>
        ) : (
          <div className="text-xs text-gray-300 italic">Upcoming</div>
        )}
      </div>
    );
  }

  if (phase === "recall") {
    return (
      <div>
        <div
          className="text-sm font-medium mb-1 transition-colors duration-300"
          style={{ color: current ? pathColor : visited ? "#374151" : "#d1d5db" }}
        >
          {stop.name}
        </div>
        {stop.revealed ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base">{stop.object}</span>
            {stop.correct !== undefined ? (
              stop.correct ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            ) : null}
          </div>
        ) : current ? (
          <div className="text-xs italic" style={{ color: pathColor }}>
            What is here?
          </div>
        ) : visited ? (
          <div className="text-xs text-gray-400 italic">Answered</div>
        ) : (
          <div className="text-xs text-gray-300 italic">Coming up...</div>
        )}
      </div>
    );
  }

  // results phase
  return (
    <div>
      <div className="text-sm text-gray-500 font-medium mb-1">{stop.name}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-base">{stop.object || "—"}</span>
        {stop.correct !== undefined ? (
          stop.correct ? (
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        ) : null}
      </div>
    </div>
  );
}
