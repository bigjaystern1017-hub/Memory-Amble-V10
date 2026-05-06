import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Brain } from "lucide-react";
import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

const QUESTIONS = [
  {
    text: "Picture your kitchen right now. How many things on the counter can you name?",
    answers: [
      { label: "Maybe 1 or 2", score: 1 },
      { label: "3 to 5 — I can see it pretty clearly", score: 2 },
      { label: "6 or more — I know that counter like the back of my hand", score: 3 },
      { label: "I'd have to go look", score: 0 },
    ],
  },
  {
    text: "What did you have for dinner two nights ago?",
    answers: [
      { label: "I remember exactly", score: 3 },
      { label: "I remember the general idea", score: 2 },
      { label: "I'd have to think hard", score: 1 },
      { label: "No idea", score: 0 },
    ],
  },
  {
    text: "If I asked you to memorize a grocery list of 8 items right now, how would you do it?",
    answers: [
      { label: "I'd just try to repeat them in my head", score: 1 },
      { label: "I'd write them down — I don't trust my memory", score: 0 },
      { label: "I have my own tricks", score: 2 },
      { label: "I'd probably forget half of them", score: 1 },
    ],
  },
  {
    text: "Can you name 3 people you had a conversation with this week?",
    answers: [
      { label: "Easily — I remember all of them", score: 3 },
      { label: "I can get 2 for sure", score: 2 },
      { label: "Maybe 1", score: 1 },
      { label: "It's been a blur honestly", score: 0 },
    ],
  },
  {
    text: "When you walk into a room and forget why — how often does that happen?",
    answers: [
      { label: "Rarely", score: 3 },
      { label: "Once in a while", score: 2 },
      { label: "A few times a week", score: 1 },
      { label: "I'm in that room right now", score: 0 },
    ],
  },
];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [visible, setVisible] = useState(true);
  const [, navigate] = useLocation();

  function transition(fn: () => void) {
    setVisible(false);
    setTimeout(() => {
      fn();
      setVisible(true);
    }, 200);
  }

  function handleAnswer(score: number) {
    transition(() => {
      setScores((prev) => [...prev, score]);
      setStep((s) => s + 1);
    });
  }

  function handleStart() {
    transition(() => setStep(1));
  }

  async function handleShare() {
    try {
      await navigator.share({ title: "How sharp is your memory?", url: window.location.href });
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch {
        // ignore
      }
    }
  }

  const total = scores.reduce((a, b) => a + b, 0);

  let resultHeading = "";
  let resultSubtext = "";
  if (total >= 12) {
    resultHeading = "Your memory is sharper than you think.";
    resultSubtext = "You've got strong foundations. Imagine what happens when you add a system.";
  } else if (total >= 7) {
    resultHeading = "You're doing better than you realize.";
    resultSubtext = "A few blind spots — but that's exactly what training is for. Most people see improvement in under a week.";
  } else {
    resultHeading = "You're not alone — and it's not too late.";
    resultSubtext = "The fact that you took this quiz means you care. That's the first step. The Memory Palace technique was built for exactly this.";
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#F3F0FC" }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: "#26215C" }}>MemoryAmble</span>
        </div>

        <div
          className="w-full flex flex-col items-center gap-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {step === 0 && (
            <>
              <h1 className="font-serif text-3xl font-bold text-center" style={{ color: "#26215C" }}>
                How sharp is your memory?
              </h1>
              <p className="text-gray-500 text-center">5 quick questions. 60 seconds. No signup needed.</p>
              <button
                onClick={handleStart}
                className="bg-primary text-white py-4 px-8 rounded-full text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity mt-2"
                data-testid="button-quiz-start"
              >
                Let's find out →
              </button>
            </>
          )}

          {step >= 1 && step <= 5 && (() => {
            const q = QUESTIONS[step - 1];
            return (
              <>
                <p className="text-sm text-gray-400">{step} of 5</p>
                <h2 className="font-serif text-xl text-center" style={{ color: "#26215C" }}>
                  {q.text}
                </h2>
                <div className="w-full flex flex-col gap-3">
                  {q.answers.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(a.score)}
                      className="w-full bg-white rounded-xl shadow-sm border border-purple-200 py-3 px-5 text-left text-gray-700 hover:border-purple-400 transition-all cursor-pointer"
                      data-testid={`button-answer-${i}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            );
          })()}

          {step === 6 && (
            <>
              <h2 className="font-serif text-2xl font-bold text-center" style={{ color: "#26215C" }}>
                {resultHeading}
              </h2>
              <p className="text-gray-600 text-center">{resultSubtext}</p>
              <p className="text-sm text-gray-400">Your score: {total} out of 15</p>

              <div className="w-full border-t border-purple-200 my-2" />

              <img
                src={timbukAvatarPath}
                alt="Timbuk"
                className="rounded-full object-cover"
                style={{ width: 64, height: 64 }}
              />
              <p className="text-gray-600 text-center">
                Timbuk is ready to show you a 2,000-year-old technique that takes 10 minutes to learn.
              </p>

              <button
                onClick={() => {
                  localStorage.setItem("memoryamble-goal", "curiosity");
                  navigate("/amble");
                }}
                className="bg-primary text-white py-4 px-8 rounded-full text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity"
                data-testid="button-quiz-cta"
              >
                Try Day 1 Free →
              </button>
              <p className="text-xs text-gray-400">No account needed. No credit card.</p>
              <button
                onClick={handleShare}
                className="text-sm text-purple-500 hover:text-purple-700 underline transition-colors mt-1"
                data-testid="button-quiz-share"
              >
                Share this quiz
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
