import { BookOpen, MapPin, Sprout, Footprints, Eye, Wind } from "lucide-react";

const defaultSteps = [
  { label: "Learn", icon: BookOpen },
  { label: "Choose Place", icon: MapPin },
  { label: "Plant Images", icon: Sprout },
  { label: "Walk the Route", icon: Footprints },
  { label: "Recall", icon: Eye },
];

const cleaningSteps = [
  { label: "Clearing", icon: Wind },
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
    <div className="flex items-center justify-center py-4 px-2" data-testid="progress-bar">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isComplete = i < currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                  isActive
                    ? "shadow-purple-200"
                    : isComplete
                    ? ""
                    : "bg-gray-100"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "#6D2DE2", color: "#fff" }
                    : isComplete
                    ? { backgroundColor: "#EDE9FE", color: "#6D2DE2" }
                    : { color: "#9CA3AF" }
                }
                data-testid={`progress-step-${i}`}
              >
                <Icon className="w-5 h-5 md:w-5 md:h-5" />
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#6D2DE2] font-semibold"
                    : isComplete
                    ? "text-[#6D2DE2]"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 md:w-10 h-px mx-1 mb-6 transition-colors ${
                  i < currentStep ? "bg-purple-300" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
