import { useState } from "react";

interface RecallChoicesProps {
  choices: string[];
  choiceEmojis: string[];
  onSelect: (answer: string) => void;
  correctAnswer: string;
  disabled: boolean;
}

type CardState = "idle" | "correct" | "wrong" | "reveal";

export default function RecallChoices({
  choices,
  choiceEmojis,
  onSelect,
  correctAnswer,
  disabled,
}: RecallChoicesProps) {
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});
  const [locked, setLocked] = useState(false);

  const handleTap = (choice: string, index: number) => {
    if (disabled || locked) return;
    setLocked(true);

    const isCorrect = choice === correctAnswer;
    const correctIndex = choices.indexOf(correctAnswer);

    if (isCorrect) {
      setCardStates({ [index]: "correct" });
      setTimeout(() => {
        onSelect(choice);
      }, 600);
    } else {
      setCardStates({ [index]: "wrong" });
      setTimeout(() => {
        setCardStates({ [index]: "wrong", [correctIndex]: "reveal" });
        setTimeout(() => {
          onSelect(choice);
        }, 400);
      }, 400);
    }
  };

  const getCardClass = (index: number) => {
    const state = cardStates[index];
    const base =
      "py-5 px-3 rounded-xl text-center border-2 bg-white transition-all cursor-pointer shadow-sm";

    if (state === "correct") return `${base} border-green-500 bg-green-50`;
    if (state === "wrong") return `${base} border-red-300 bg-red-50`;
    if (state === "reveal") return `${base} border-green-500 bg-green-50`;
    if (locked) return `${base} border-purple-200 opacity-60 cursor-default`;
    return `${base} border-purple-200 hover:border-purple-400`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
      {choices.map((choice, index) => (
        <button
          key={index}
          className={getCardClass(index)}
          onClick={() => handleTap(choice, index)}
          disabled={locked || disabled}
        >
          <div className="text-3xl mb-2">{choiceEmojis[index]}</div>
          <div className="text-sm font-medium text-gray-700 capitalize">{choice}</div>
        </button>
      ))}
    </div>
  );
}
