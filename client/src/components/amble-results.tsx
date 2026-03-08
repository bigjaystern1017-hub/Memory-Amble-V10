import { Trophy, Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AmbleResultsProps {
  correctCount: number;
  totalItems: number;
  streak: number;
  onContinue: () => void;
}

export function AmbleResults({ correctCount, totalItems, streak, onContinue }: AmbleResultsProps) {
  const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  
  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center px-4 py-8 safe-area-inset">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            Session Complete!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Your Memory Palace is thriving.
          </p>
        </div>

        <div className="bg-background border border-primary/20 rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
              Today's Performance
            </p>
            <p className="text-5xl md:text-6xl font-bold font-serif">
              {correctCount}
              <span className="text-xl md:text-2xl text-muted-foreground ml-2">
                of {totalItems}
              </span>
            </p>
            <p className="text-lg text-muted-foreground">
              You remembered {correctCount} out of {totalItems} items today!
            </p>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">
                {streak} {streak === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            {percentage === 100
              ? "A perfect walk! Your palace is rock solid."
              : percentage >= 66
              ? "That's genuinely impressive. Your palace is working beautifully."
              : percentage >= 33
              ? "Good work today. The pictures are taking shape."
              : "You built a palace and walked through it. That's a real start."}
          </p>

          <p className="text-sm text-muted-foreground">
            Walk through your palace one more time tonight — the images will get even stickier.
          </p>
        </div>

        <Button
          size="lg"
          onClick={onContinue}
          className="gap-2 text-lg px-8 py-6 w-full sm:w-auto"
          data-testid="button-see-you-tomorrow"
        >
          <ArrowLeft className="w-5 h-5" />
          See You Tomorrow
        </Button>
      </div>
    </div>
  );
}
