import timbukAvatarPath from "@assets/timbuk-avatar_1773957235129.png";

interface TimbukBarProps {
  message: string;
  currentStep: number;
  totalSteps: number;
}

export default function TimbukBar({ message, currentStep, totalSteps }: TimbukBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex items-center gap-3 px-4"
      style={{ height: 72 }}
    >
      <img
        src={timbukAvatarPath}
        alt="Timbuk"
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: 48, height: 48 }}
      />

      <div className="flex-1 flex justify-center">
        <div className="bg-purple-50 rounded-2xl px-4 py-2 text-sm max-w-[60%] text-gray-700 leading-snug">
          {message}
        </div>
      </div>

      <div className="flex-shrink-0 text-xs text-gray-400 text-right">
        <span className="font-medium text-gray-600">{currentStep}</span>
        <span> / {totalSteps}</span>
      </div>
    </div>
  );
}
