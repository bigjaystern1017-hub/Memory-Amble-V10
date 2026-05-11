import { useState } from "react";
import { ArrowRight, ChevronRight, Home, Sprout, PersonStanding, Brain, Heart, Shield, Star } from "lucide-react";
import { playSound } from "@/lib/sounds";

interface EducationSlidesProps {
  onComplete: () => void;
}

const GOALS = [
  { id: "names", label: "Remembering names and faces", icon: Brain },
  { id: "sharp", label: "Staying sharp for the people I love", icon: Heart },
  { id: "active", label: "Keeping my mind active and strong", icon: Shield },
  { id: "confident", label: "Feeling more confident in everyday life", icon: Star },
];

export function EducationSlides({ onComplete }: EducationSlidesProps) {
  const [screen, setScreen] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleGoalSelect = (id: string) => {
    playSound("click");
    setSelectedGoal(id);
  };

  const handleGoalContinue = () => {
    if (!selectedGoal) return;
    playSound("click");
    localStorage.setItem("memoryamble-goal", selectedGoal);
    setScreen(1);
  };

  /* ── SCREEN 0: GOAL SELECTION ── */
  if (screen === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 md:px-8 py-10">
        <div className="max-w-lg w-full space-y-7">
          <div className="text-center space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.14em] bg-purple-50 border border-purple-100"
              style={{ color: "#6D2DE2" }}>
              Before we begin
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#1A1028]">
              What matters most to you right now?
            </h2>
            <p className="text-base text-muted-foreground">
              Timbuk will use this to personalise your experience.
            </p>
          </div>

          <div className="space-y-3">
            {GOALS.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  style={
                    isSelected
                      ? { borderColor: "#6D2DE2", backgroundColor: "#F5F0FF" }
                      : { borderColor: "#E8E3F4", backgroundColor: "#FFFFFF" }
                  }
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={
                      isSelected
                        ? { backgroundColor: "#6D2DE2" }
                        : { backgroundColor: "#F0EBFF" }
                    }
                  >
                    <Icon className="w-5 h-5" style={{ color: isSelected ? "#fff" : "#6D2DE2" }} />
                  </div>
                  <span className="flex-1 font-medium text-base text-[#1A1028]">{goal.label}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: isSelected ? "#6D2DE2" : "#C4B5FD" }} />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGoalContinue}
            disabled={!selectedGoal}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: "#6D2DE2" }}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  /* ── SCREEN 1: YOUR BRAIN ── */
  if (screen === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 md:px-8 py-10">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: "#F0EBFF" }}
            >
              <Brain className="w-10 h-10" style={{ color: "#6D2DE2" }} />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#1A1028]">
              Your brain already knows how to do this.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We just show it the door.
            </p>
          </div>
          <div className="rounded-2xl p-6 text-left space-y-3" style={{ backgroundColor: "#FFF8EC", border: "1px solid #F3DFB5" }}>
            <p className="font-serif text-lg leading-relaxed" style={{ color: "#7A5C1E" }}>
              "The Memory Palace is a 2,500 year old technique used by scholars, orators, and memory champions. It works because your brain is extraordinary at remembering places and vivid images — far better than dry facts."
            </p>
            <p className="text-sm italic" style={{ color: "#A07840" }}>— Timbuk</p>
          </div>
          <button
            onClick={() => { playSound("click"); setScreen(2); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-150"
            style={{ backgroundColor: "#6D2DE2" }}
          >
            Tell me more <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  /* ── SCREEN 2: HOW IT WORKS ── */
  if (screen === 2) {
    const HOW_STEPS = [
      {
        icon: Home,
        number: "1.",
        title: "Pick a place you know",
        body: "Your home, a favourite walk, somewhere you've been a thousand times. That's your Memory Palace. It already exists.",
      },
      {
        icon: Sprout,
        number: "2.",
        title: "Plant vivid images",
        body: "Timbuk gives you items. You make them strange, personal, yours. The weirder the better — that's the whole secret.",
      },
      {
        icon: PersonStanding,
        number: "3.",
        title: "Walk and recall",
        body: "Stroll through your palace in your mind. Whatever you planted will be waiting. Every single time.",
      },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 md:px-8 py-10">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.14em] bg-purple-50 border border-purple-100"
              style={{ color: "#6D2DE2" }}>
              Day 1 · The Foundation
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#1A1028]">
              Let's build your memory palace—together.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We'll start with simple, powerful steps that turn your world into a place you can always remember.
            </p>
          </div>

          <div className="space-y-4">
            {HOW_STEPS.map(({ icon: Icon, number, title, body }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E3F4", boxShadow: "0 2px 8px rgba(109,45,226,0.06)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "#F0EBFF" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#6D2DE2" }} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1028] text-base">
                    <span style={{ color: "#6D2DE2" }}>{number}</span> {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-center">
            <button
              onClick={() => { playSound("click"); setScreen(3); }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-150"
              style={{ backgroundColor: "#6D2DE2" }}
            >
              I'm ready <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground">Takes just a few minutes to begin</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── SCREEN 3: NO TEST / FINAL ── */
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 md:px-8 py-10">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "#F0EBFF" }}
          >
            <Star className="w-10 h-10" style={{ color: "#6D2DE2" }} />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#1A1028]">
            No test. No pressure.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Most people remember more than they expect on Day 1.
          </p>
          <p className="text-muted-foreground">
            Timbuk teaches through doing, not lecturing. You'll be building your first Memory Palace in minutes.
          </p>
        </div>
        <button
          onClick={() => { playSound("click"); onComplete(); }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-150"
          style={{ backgroundColor: "#6D2DE2" }}
        >
          Begin the walk <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
