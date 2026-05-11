import { CheckCircle2, MapPin } from "lucide-react";

export type MemoryRoutePanelProps = {
  placeName?: string;
  stops?: string[];
  assignments?: Array<{ stopName?: string; object?: string }>;
  userScenes?: string[];
  currentStepIndex?: number;
  currentBeat?: string;
};

const PLACEMENT_BEATS = new Set([
  "place-object", "mirror-object", "react-practice", "onboard-practice", "onboard-vivid",
]);
const RECALL_BEATS = new Set([
  "recall", "react-recall", "check-in", "check-in-intro", "check-in-recall",
]);
const BUILDING_BEATS = new Set([
  "interview-place", "interview-stop", "react-place", "react-stop", "assigning",
]);

function getPanelTitle(beat?: string): { title: string; sub: string } {
  if (!beat) return { title: "Today's Route", sub: "Your memory palace is taking shape." };
  if (BUILDING_BEATS.has(beat)) return { title: "Build Your Route", sub: "Choose stops you know well." };
  if (PLACEMENT_BEATS.has(beat)) return { title: "Planting Images", sub: "Make each one vivid and strange." };
  if (RECALL_BEATS.has(beat)) return { title: "Walk It Back", sub: "Close your eyes and remember." };
  return { title: "Today's Route", sub: "Your memory palace is taking shape." };
}

export function MemoryRoutePanel({
  placeName,
  stops = [],
  assignments = [],
  userScenes = [],
  currentStepIndex = 0,
  currentBeat,
}: MemoryRoutePanelProps) {
  const { title, sub } = getPanelTitle(currentBeat);
  const hasStops = stops.length > 0;

  return (
    <div
      className="rounded-2xl flex flex-col gap-0 overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E3F4",
        boxShadow: "0 2px 12px rgba(109,45,226,0.07)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#F0EBF8" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin className="w-4 h-4" style={{ color: "#6D2DE2" }} />
          <h3 className="font-semibold text-sm" style={{ color: "#1A1028" }}>{title}</h3>
        </div>
        <p className="text-xs" style={{ color: "#9C8BB4" }}>{sub}</p>

        {placeName && (
          <div
            className="mt-3 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ backgroundColor: "#F5F0FF", color: "#6D2DE2" }}
          >
            {placeName.charAt(0).toUpperCase() + placeName.slice(1).replace(/^my /i, "Your ")}
          </div>
        )}
      </div>

      {/* Route list */}
      <div className="px-5 py-4 flex-1">
        {!hasStops ? (
          <p className="text-xs leading-relaxed text-center py-4" style={{ color: "#C4B5FD" }}>
            Your route will appear here as you build it with Timbuk.
          </p>
        ) : (
          <div className="space-y-2">
            {stops.map((stop, i) => {
              const assignment = assignments[i];
              const scene = userScenes[i];
              const object = assignment?.object;
              const isActive = i === currentStepIndex;
              const isComplete = i < currentStepIndex || (!!object && i <= currentStepIndex);

              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl px-3 py-3 transition-all duration-200"
                  style={
                    isActive
                      ? { backgroundColor: "#F5F0FF", border: "1px solid #D4C0F8" }
                      : isComplete
                      ? { backgroundColor: "#FAFAFE", border: "1px solid #EDE9FA" }
                      : { backgroundColor: "#FAFAFA", border: "1px solid #F0EDF8" }
                  }
                >
                  {/* Number / Check circle */}
                  <div className="shrink-0 mt-0.5">
                    {isComplete && object ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#EDE9FE" }}
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: "#6D2DE2" }} />
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={
                          isActive
                            ? { backgroundColor: "#6D2DE2", color: "#fff" }
                            : { backgroundColor: "#EDE9FE", color: "#9C8BB4" }
                        }
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: isActive ? "#1A1028" : isComplete ? "#3D2E6E" : "#A094BC" }}
                      >
                        {stop}
                      </span>
                      {object && (
                        <>
                          <span className="text-xs" style={{ color: "#C4B5FD" }}>—</span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#6D2DE2" }}
                          >
                            {object.charAt(0).toUpperCase() + object.slice(1)}
                          </span>
                        </>
                      )}
                    </div>
                    {scene && (
                      <p
                        className="text-xs leading-snug mt-1 italic line-clamp-2"
                        style={{ color: "#9C8BB4" }}
                      >
                        "{scene}"
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
