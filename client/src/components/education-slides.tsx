import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Landmark, Lightbulb, Heart } from "lucide-react";

interface EducationSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Landmark,
    title: "The History",
    subtitle: "An ancient technique, rediscovered",
    body: "Over 2,500 years ago, a Greek poet named Simonides discovered something remarkable. After a building collapsed, he found he could remember every person who had been there -- simply by picturing where they had been sitting.\n\nThat moment gave birth to the Memory Palace technique. It has been used ever since by scholars, orators, and memory champions around the world.",
  },
  {
    icon: Lightbulb,
    title: "How It Works",
    subtitle: "Your mind already knows the way",
    body: "Think of a place you know well -- your home, a favourite walk, a garden. Now imagine placing strange, vivid objects along your route.\n\nWhen you need to remember something, you simply \"walk\" through that place in your mind. Each stop triggers the image, and the image triggers the memory. It feels almost like magic, but it is pure science.",
  },
  {
    icon: Heart,
    title: "Why It Works",
    subtitle: "Built on how your brain naturally thinks",
    body: "Your brain is wired to remember places and pictures far better than lists and words. The Memory Palace takes advantage of two powerful systems: spatial memory (knowing where things are) and visual memory (remembering vivid images).\n\nThe more bizarre and funny the image, the stronger the memory. That is why we make it fun.",
  },
];

export function EducationSlides({ onComplete }: EducationSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 md:px-6">
      <div className="flex gap-2 mb-8" data-testid="slide-dots">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentSlide ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          <h2
            className="font-serif text-2xl md:text-3xl font-semibold mb-2"
            data-testid={`slide-title-${currentSlide}`}
          >
            {slide.title}
          </h2>
          <p className="text-muted-foreground text-xl mb-6">{slide.subtitle}</p>

          <div className="bg-card border border-border rounded-md px-6 py-5 text-left">
            <p
              className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap"
              data-testid={`slide-body-${currentSlide}`}
            >
              {slide.body}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3 mt-8">
        {currentSlide > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setCurrentSlide((p) => p - 1)}
            className="gap-2"
            data-testid="button-slide-back"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        )}

        <Button
          size="lg"
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setCurrentSlide((p) => p + 1);
            }
          }}
          className="gap-2"
          data-testid="button-slide-next"
        >
          {isLast ? "Let's Begin!" : "Next"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
