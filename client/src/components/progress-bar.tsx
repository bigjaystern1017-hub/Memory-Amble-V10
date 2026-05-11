import { BookOpen, MapPin, Sparkles, Eye, Trophy, Wind, Sprout, Footprints } from "lucide-react";

const defaultSteps = [
  { label: "Learn", icon: BookOpen },
  { label: "Choose Place", icon: MapPin },
  { label: "Plant Images", icon: Sprout },
  { label: "Walk the Route", icon: Footprints },
  { label: "Recall", icon: Eye },
];

const cleaningSteps = [
  { label: "Cleaning", icon: Wind },
  { label: "Choose Place", icon: MapPin },
  { label: "Plant Images", icon: Sprout },
  { label: "Walk the Route", icon: Footprints },
  { label: "Recall", icon: Eye },
];

interface ProgressBarProps {
  currentStep: number;
  isCleaning?: boolean;
}

export function ProgressBar({ currentStep, isCleaning }: ProgressBarProps) {
  const steps = isCleaning ? cleaningSteps : defaultSteps;
  return (
    <div className="flex items-center justify-center py-3" data-testid="progress-bar">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isComplete = i < currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? "shadow-md" : ""
                }`}
                style={
                  isActive
                    ? { backgroundColor: "#6D2DE2", boxShadow: "0 2px 8px rgba(109,45,226,0.35)" }
                    : isComplete
                    ? { backgroundColor: "#EDE9FE" }
                    : { backgroundColor: "#F1F0F5" }
                }
                data-testid={`progress-step-${i}`}
                role="img"
                aria-label={`${step.label}${isActive ? " — current step" : isComplete ? " — complete" : ""}`}
              >
                <Icon
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={
                    isActive
                      ? { color: "#ffffff" }
                      : isComplete
                      ? { color: "#6D2DE2" }
                      : { color: "#B0ABBD" }
                  }
                />
              </div>
              <span
                className="hidden sm:block text-xs font-medium transition-colors whitespace-nowrap"
                style={
                  isActive
                    ? { color: "#6D2DE2" }
                    : isComplete
                    ? { color: "#6D2DE2" }
                    : { color: "#B0ABBD" }
                }
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-px w-5 sm:w-8 md:w-12 mx-1 sm:mb-5 transition-colors"
                style={i < currentStep ? { backgroundColor: "#C4B5FD" } : { backgroundColor: "#E5E3ED" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
