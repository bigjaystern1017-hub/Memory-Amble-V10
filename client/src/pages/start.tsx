import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Brain } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

export default function Start() {
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [step]);

  function handleGoal(value: string) {
    localStorage.setItem("memoryamble-goal", value);
    setStep(2);
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#F3F0FC" }}
    >
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-serif text-xl font-semibold" style={{ color: "#26215C" }}>MemoryAmble</span>
      </div>

      {step === 1 && (
        <div className="w-full flex flex-col items-center gap-5">
          <h1 className="font-serif text-2xl text-center" style={{ color: "#26215C" }}>
            What matters most to you right now?
          </h1>
          <div className="w-full flex flex-col items-center gap-3">
            {[
              { label: "Remembering names and faces", value: "names" },
              { label: "Staying sharp for my family", value: "sharp" },
              { label: "Keeping my mind active", value: "active" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleGoal(value)}
                className="w-full max-w-sm mx-auto py-4 px-6 bg-white rounded-xl shadow-sm border border-purple-200 text-lg text-gray-700 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer text-left"
                data-testid={`button-goal-${value}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div
          className="flex flex-col items-center gap-6 text-center transition-opacity duration-500"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <img
            src={timbukAvatarPath}
            alt="Timbuk"
            className="rounded-full object-cover"
            style={{ width: 80, height: 80 }}
          />
          <h1 className="font-serif text-2xl" style={{ color: "#26215C" }}>
            Timbuk is ready for you.
          </h1>
          <p className="text-gray-500">Day 1 takes 10 minutes. No account needed.</p>
          <button
            onClick={() => navigate("/amble")}
            className="bg-primary text-white py-4 px-8 rounded-full text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity"
            data-testid="button-start-walk"
          >
            Start My First Walk →
          </button>
          <p className="text-xs text-gray-400">Free. No credit card.</p>
        </div>
      )}
    </div>
  );
}
