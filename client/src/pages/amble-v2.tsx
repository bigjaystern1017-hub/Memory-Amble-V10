import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";
import VisualPath from "@/components/visual-path";
import TimbukBar from "@/components/timbuk-bar";
import PlacementCard from "@/components/placement-card";
import RecallChoices from "@/components/recall-choices";
import { playSound } from "@/lib/sounds";
import { useAuth } from "@/hooks/use-auth";

// ---------------------------------------------------------------------------
// Emoji lookup (mirrors beat-engine.ts without re-exporting)
// ---------------------------------------------------------------------------
const ITEM_EMOJIS: Record<string, string> = {
  "guitar": "🎸", "violin": "🎻", "trombone": "🎺", "accordion": "🪗",
  "ladder": "🪜", "ironing board": "👔", "wheelbarrow": "🛺", "birdbath": "🐦",
  "garden gnome": "🧙", "park bench": "🪑", "mailbox": "📬", "traffic cone": "🚧",
  "watermelon": "🍉", "wedding cake": "🎂", "pineapple": "🍍", "lobster": "🦞",
  "gingerbread house": "🏠", "rocking horse": "🐴", "grandfather clock": "🕰️",
  "typewriter": "⌨️", "jukebox": "🎵", "telephone booth": "📞", "globe": "🌍",
  "gramophone": "📻", "bowling ball": "🎳", "trophy": "🏆", "dartboard": "🎯",
  "sunflower": "🌻", "cactus": "🌵", "beehive": "🐝", "fire truck": "🚒",
  "fishing rod": "🎣", "anchor": "⚓", "canoe": "🛶", "surfboard": "🏄",
  "penguin": "🐧", "flamingo": "🦩", "tortoise": "🐢", "parrot": "🦜",
  "goldfish": "🐟", "swan": "🦢", "peacock": "🦚", "telescope": "🔭",
  "compass": "🧭", "lantern": "🏮", "weathervane": "🌬️", "top hat": "🎩",
  "monocle": "🧐", "crown": "👑", "scepter": "⚜️", "disco ball": "🪩",
  "pinball machine": "🎮", "parachute": "🪂", "hot air balloon": "🎈",
  "$100 bill": "💵", "umbrella": "☂️",
};

function getItemEmoji(item: string): string {
  const lower = item.toLowerCase().replace(/^a\s+|^an\s+|^the\s+/i, "").trim();
  return ITEM_EMOJIS[lower] || "📦";
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const PATHS = [
  {
    name: "My House",
    color: "#8B6F47",
    stops: ["Front door", "Kitchen counter", "Hallway", "Living room", "Bedroom", "Bathroom", "Back yard", "Garage", "Attic", "Basement"],
  },
  {
    name: "The Garden",
    color: "#4CAF50",
    stops: ["Garden gate", "Flower bed", "Bench", "Fountain", "Shed", "Vegetable patch", "Tree swing", "Greenhouse", "Stone path", "Pond"],
  },
  {
    name: "The Palace",
    color: "#7C3AED",
    stops: ["Grand entrance", "Throne room", "Library", "Courtyard", "Tower", "Banquet hall", "Dungeon", "Observatory", "Treasury", "Chapel"],
  },
];

const DIFFICULTY_OPTIONS = [3, 5, 8, 10];
const LOCKED_OPTIONS = [8, 10];

const PLACEMENT_CONFIRMATIONS = [
  "Hiding it away...",
  "That one will stick.",
  "Locked in.",
  "Tucked away nicely.",
  "Not forgetting that one.",
  "Oh, that image will last.",
];

const RECALL_CORRECT_MESSAGES = [
  "Still there.",
  "You found it.",
  "Palace is working.",
  "Right where you left it.",
  "Sharp.",
];

const FALLBACK_DECOYS = ["pineapple", "umbrella", "telescope", "flamingo", "accordion", "surfboard", "lantern", "crown"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ObjectItem {
  name: string;
  emoji: string;
  modifier: string;
  stopName: string;
}

interface UserAnswer {
  object: string;
  correct: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateChoices(currentIdx: number, objects: ObjectItem[]) {
  const correct = objects[currentIdx];
  const others = objects.filter((_, i) => i !== currentIdx);
  const decoyPool: ObjectItem[] = [...others];
  let fallbackIdx = 0;
  while (decoyPool.length < 3) {
    const name = FALLBACK_DECOYS[fallbackIdx % FALLBACK_DECOYS.length];
    fallbackIdx++;
    if (!decoyPool.some((d) => d.name === name) && name !== correct.name) {
      decoyPool.push({ name, emoji: getItemEmoji(name), modifier: "", stopName: "" });
    }
  }
  const decoys = decoyPool.slice(0, 3);
  const all = shuffle([correct, ...decoys]);
  return {
    choices: all.map((o) => o.name),
    emojis: all.map((o) => o.emoji),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AmbleV2() {
  const { session } = useAuth();

  const [phase, setPhase] = useState<"path-select" | "placement" | "recall" | "results">("path-select");
  const [selectedPath, setSelectedPath] = useState<(typeof PATHS)[0] | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timbukMessage, setTimbukMessage] = useState("Choose your path.");
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [recallChoices, setRecallChoices] = useState<string[]>([]);
  const [recallChoiceEmojis, setRecallChoiceEmojis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollText, setScrollText] = useState<string | null>(null);
  const [scrollLoading, setScrollLoading] = useState(false);
  const [recallDisabled, setRecallDisabled] = useState(false);
  const [placementMsgIdx, setPlacementMsgIdx] = useState(0);

  // Build VisualPath stops for current phase
  const buildPathStops = useCallback(
    (objs: ObjectItem[], answers: UserAnswer[], ph: string) => {
      const stops = selectedPath?.stops.slice(0, difficulty) || [];
      return stops.map((stopName, i) => {
        const obj = objs[i];
        if (ph === "placement") {
          return {
            name: stopName,
            object: obj?.modifier ? `${obj.modifier} ${obj.emoji} ${obj.name}` : obj ? `${obj.emoji} ${obj.name}` : undefined,
            modifier: obj?.modifier,
            revealed: i < currentIndex,
          };
        }
        if (ph === "recall") {
          return {
            name: stopName,
            object: obj ? `${obj.emoji} ${obj.name}` : undefined,
            revealed: answers[i] !== undefined,
            correct: answers[i]?.correct,
          };
        }
        // results
        return {
          name: stopName,
          object: obj ? `${obj.emoji} ${obj.name}` : undefined,
          revealed: true,
          correct: answers[i]?.correct,
        };
      });
    },
    [selectedPath, difficulty, currentIndex]
  );

  // -------------------------------------------------------------------------
  // Start a session
  // -------------------------------------------------------------------------
  const handleStart = useCallback(
    async (path: (typeof PATHS)[0]) => {
      setIsLoading(true);
      setSelectedPath(path);
      const stops = path.stops.slice(0, difficulty);
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/assign-objects", {
          method: "POST",
          headers,
          body: JSON.stringify({ stops, category: "objects", dayCount: 0 }),
        });
        const data = await res.json();
        const assigned: ObjectItem[] = (data.assignments || []).map(
          (a: { stopName: string; object: string }) => ({
            name: a.object,
            emoji: getItemEmoji(a.object),
            modifier: "",
            stopName: a.stopName,
          })
        );
        setObjects(assigned);
        setTotalSteps(assigned.length);
        setCurrentIndex(0);
        setUserAnswers([]);
        setScore(0);
        setTimbukMessage("Place each object. Make it memorable.");
        setPhase("placement");
      } catch {
        setTimbukMessage("Oops — couldn't load objects. Try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [difficulty, session]
  );

  // -------------------------------------------------------------------------
  // Placement handler
  // -------------------------------------------------------------------------
  const handlePlaced = useCallback(
    (modifier: string) => {
      playSound("click");

      const msg = PLACEMENT_CONFIRMATIONS[placementMsgIdx % PLACEMENT_CONFIRMATIONS.length];
      setPlacementMsgIdx((p) => p + 1);
      setTimbukMessage(msg);

      setObjects((prev) => {
        const updated = [...prev];
        updated[currentIndex] = { ...updated[currentIndex], modifier };
        return updated;
      });

      const nextIndex = currentIndex + 1;

      setTimeout(() => {
        if (nextIndex >= totalSteps) {
          playSound("magic-transition");
          setTimbukMessage("Time to walk. Can you find them all?");
          setTimeout(() => {
            setCurrentIndex(0);
            setObjects((prev) => prev.map((o) => ({ ...o })));
            setPhase("recall");
            // Pre-generate choices for first recall stop
            setObjects((prev) => {
              const { choices, emojis } = generateChoices(0, prev);
              setRecallChoices(choices);
              setRecallChoiceEmojis(emojis);
              return prev;
            });
            setTimbukMessage("What is at the first stop?");
          }, 1500);
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 800);
    },
    [currentIndex, totalSteps, placementMsgIdx]
  );

  // -------------------------------------------------------------------------
  // Recall handler
  // -------------------------------------------------------------------------
  const handleRecallSelect = useCallback(
    (answer: string) => {
      if (recallDisabled) return;
      setRecallDisabled(true);

      const correctObj = objects[currentIndex];
      const isCorrect = answer.toLowerCase() === correctObj.name.toLowerCase();

      const newAnswer: UserAnswer = { object: answer, correct: isCorrect };
      const newAnswers = [...userAnswers, newAnswer];
      setUserAnswers(newAnswers);

      if (isCorrect) {
        playSound("correct");
        setScore((s) => s + 1);
        const msg = RECALL_CORRECT_MESSAGES[newAnswers.length % RECALL_CORRECT_MESSAGES.length];
        setTimbukMessage(msg);
      } else {
        setTimbukMessage(`It was ${correctObj.emoji} ${correctObj.name}. Keep walking.`);
      }

      const nextIndex = currentIndex + 1;

      setTimeout(() => {
        setRecallDisabled(false);
        if (nextIndex >= totalSteps) {
          playSound("complete");
          setPhase("results");
        } else {
          setCurrentIndex(nextIndex);
          const { choices, emojis } = generateChoices(nextIndex, objects);
          setRecallChoices(choices);
          setRecallChoiceEmojis(emojis);
          setTimbukMessage("What is here?");
        }
      }, 1000);
    },
    [recallDisabled, objects, currentIndex, userAnswers, totalSteps]
  );

  // -------------------------------------------------------------------------
  // Generate scroll
  // -------------------------------------------------------------------------
  const handleGenerateScroll = useCallback(async () => {
    if (scrollLoading || !selectedPath) return;
    setScrollLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const res = await fetch("/api/generate-scroll", {
        method: "POST",
        headers,
        body: JSON.stringify({
          placeName: selectedPath.name,
          stops: selectedPath.stops.slice(0, difficulty),
          assignments: objects.map((o) => ({ stopName: o.stopName, object: o.name })),
          score,
          totalItems: totalSteps,
        }),
      });
      const data = await res.json();
      setScrollText(data.scroll || data.text || "Your amble has been recorded.");
    } catch {
      setScrollText("Your amble has been recorded in the palace of memory.");
    } finally {
      setScrollLoading(false);
    }
  }, [scrollLoading, selectedPath, difficulty, objects, score, totalSteps, session]);

  const handleShare = useCallback(async () => {
    if (!scrollText) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Amble Scroll", text: scrollText });
      } else {
        await navigator.clipboard.writeText(scrollText);
        alert("Copied to clipboard!");
      }
    } catch {
      // silently fail
    }
  }, [scrollText]);

  const handleReset = useCallback(() => {
    setPhase("path-select");
    setSelectedPath(null);
    setObjects([]);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers([]);
    setScrollText(null);
    setTimbukMessage("Choose your path.");
  }, []);

  // =========================================================================
  // SCREEN 1 — Path Selection
  // =========================================================================
  if (phase === "path-select") {
    return (
      <div className="min-h-screen flex flex-col items-center py-10 px-4" style={{ backgroundColor: "#F3F0FC" }}>
        <img src={timbukAvatarPath} alt="Timbuk" className="w-20 h-20 rounded-full object-cover mb-4 shadow-md" />
        <div className="bg-white rounded-2xl px-5 py-3 text-base text-gray-700 shadow-sm mb-8 font-serif">
          Choose your path.
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4 mb-8">
          {PATHS.map((path) => (
            <button
              key={path.name}
              className="w-full max-w-sm mx-auto p-5 rounded-2xl border-2 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
              style={{ borderColor: "#e5e7eb", borderLeftColor: path.color, borderLeftWidth: 4 }}
              onClick={() => handleStart(path)}
              disabled={isLoading}
              data-testid={`path-${path.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="font-serif text-lg font-bold text-gray-800 mb-1">{path.name}</div>
              <div className="text-sm text-gray-400">
                {path.stops.slice(0, 3).join(" · ")}...
              </div>
            </button>
          ))}
        </div>

        <div className="w-full max-w-sm mb-8">
          <div className="text-sm text-gray-500 text-center mb-3 font-medium">How many items?</div>
          <div className="flex gap-2 justify-center">
            {DIFFICULTY_OPTIONS.map((d) => {
              const locked = LOCKED_OPTIONS.includes(d);
              const selected = difficulty === d;
              return (
                <button
                  key={d}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all border
                    ${selected ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-purple-200"}
                    ${locked ? "opacity-50 cursor-not-allowed" : "hover:border-purple-400 cursor-pointer"}
                  `}
                  onClick={() => !locked && setDifficulty(d)}
                  disabled={locked}
                  data-testid={`difficulty-${d}`}
                >
                  {locked && <Lock size={12} />}
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-purple-500 animate-pulse mb-4">Preparing your path...</div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2 — Placement
  // =========================================================================
  if (phase === "placement" && selectedPath) {
    const currentObj = objects[currentIndex];
    const pathStops = buildPathStops(objects, userAnswers, "placement");

    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <TimbukBar
          message={timbukMessage}
          currentStep={currentIndex + 1}
          totalSteps={totalSteps}
        />
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
          {/* Left: VisualPath — hidden on mobile */}
          <div className="hidden md:flex w-2/5 overflow-hidden border-r border-gray-100 bg-gray-50 p-4">
            <VisualPath
              stops={pathStops}
              currentStopIndex={currentIndex}
              phase="placement"
              pathColor={selectedPath.color}
            />
          </div>

          {/* Right: PlacementCard */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto bg-white">
            {/* Mobile progress */}
            <div className="md:hidden text-xs text-gray-400 mb-3 font-medium">
              {currentIndex + 1} of {totalSteps} placed
            </div>
            {currentObj && (
              <PlacementCard
                key={currentIndex}
                object={currentObj.name}
                objectEmoji={currentObj.emoji}
                stopName={currentObj.stopName}
                onPlace={handlePlaced}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3 — Recall
  // =========================================================================
  if (phase === "recall" && selectedPath) {
    const currentObj = objects[currentIndex];
    const pathStops = buildPathStops(objects, userAnswers, "recall");

    // Mobile dotted progress
    const mobileDots = objects.map((_, i) => {
      const answered = userAnswers[i] !== undefined;
      const isCur = i === currentIndex;
      return { answered, isCur, correct: userAnswers[i]?.correct };
    });

    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <TimbukBar
          message={timbukMessage}
          currentStep={currentIndex + 1}
          totalSteps={totalSteps}
        />
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
          {/* Left: VisualPath — hidden on mobile */}
          <div className="hidden md:flex w-2/5 overflow-hidden border-r border-gray-100 bg-gray-50 p-4">
            <VisualPath
              stops={pathStops}
              currentStopIndex={currentIndex}
              phase="recall"
              pathColor={selectedPath.color}
            />
          </div>

          {/* Center: Recall interaction */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto bg-white gap-6">
            {/* Mobile progress dots */}
            <div className="md:hidden flex gap-2 mb-2">
              {mobileDots.map((dot, i) => (
                <div
                  key={i}
                  className={`rounded-full border-2 transition-all ${
                    dot.isCur
                      ? "w-3 h-3 border-purple-500 bg-purple-500 animate-pulse"
                      : dot.answered
                      ? dot.correct
                        ? "w-3 h-3 border-green-500 bg-green-500"
                        : "w-3 h-3 border-red-400 bg-red-400"
                      : "w-3 h-3 border-gray-300 bg-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Stop</div>
              <div className="font-serif text-xl text-gray-800 font-semibold">
                {currentObj?.stopName}
              </div>
            </div>

            {currentObj && recallChoices.length === 4 && (
              <RecallChoices
                key={currentIndex}
                choices={recallChoices}
                choiceEmojis={recallChoiceEmojis}
                onSelect={handleRecallSelect}
                correctAnswer={currentObj.name}
                disabled={recallDisabled}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4 — Results
  // =========================================================================
  if (phase === "results" && selectedPath) {
    const pct = totalSteps > 0 ? score / totalSteps : 0;
    let resultMessage = "";
    if (pct === 1) resultMessage = "A perfect walk.";
    else if (pct >= 0.6) resultMessage = "Your palace is working.";
    else resultMessage = "Every walk makes it stronger.";

    const pathStops = buildPathStops(objects, userAnswers, "results");

    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-white">
        {/* Score */}
        <div className="text-center mb-8">
          <div className="font-serif text-5xl font-bold text-purple-700 mb-2">
            {score} <span className="text-2xl text-gray-400">of</span> {totalSteps}
          </div>
          <div className="font-serif text-xl text-gray-600">{resultMessage}</div>
        </div>

        {/* Visual path with results */}
        <div className="w-full max-w-sm mb-8 h-auto overflow-y-auto" style={{ maxHeight: "40vh" }}>
          <VisualPath
            stops={pathStops}
            currentStopIndex={totalSteps - 1}
            phase="results"
            pathColor={selectedPath.color}
          />
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
          <button
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
            onClick={handleReset}
            data-testid="button-walk-again"
          >
            Walk Again
          </button>
          <button
            className="w-full py-3 rounded-xl border-2 border-purple-200 text-purple-700 font-medium hover:border-purple-400 transition-colors"
            onClick={handleGenerateScroll}
            disabled={scrollLoading}
            data-testid="button-see-scroll"
          >
            {scrollLoading ? "Writing your scroll..." : "See Your Amble Scroll"}
          </button>
        </div>

        {/* Scroll card */}
        {scrollText && (
          <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 font-serif text-sm text-gray-700 leading-relaxed">
            <p className="mb-4 whitespace-pre-line">{scrollText}</p>
            <button
              className="text-xs text-purple-600 underline"
              onClick={handleShare}
              data-testid="button-share-scroll"
            >
              Share
            </button>
          </div>
        )}

        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return null;
}
