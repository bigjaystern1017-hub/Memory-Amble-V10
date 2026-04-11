import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Brain } from "lucide-react";

interface NameEntryProps {
  onSubmit: (name: string) => void;
}

export function NameEntry({ onSubmit }: NameEntryProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    onSubmit(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#7C3AED'}}>
          <Brain className="w-8 h-8 text-white" />
        </div>

        <h2
          className="font-serif text-2xl md:text-3xl font-semibold mb-3"
          data-testid="text-name-heading"
        >
          Before we begin...
        </h2>
        <p
          className="text-xl text-muted-foreground mb-8"
          data-testid="text-name-prompt"
        >
          I'm Timbuk. Before we take our stroll together, I'd love to know who I'm walking with today.
        </p>

        <div className="space-y-4">
          <div className="text-left">
            <label
              htmlFor="name-input"
              className="block text-lg font-medium mb-2"
            >
              Your first name
            </label>
            <Input
              id="name-input"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Jim, Gladys, Margaret..."
              className="text-xl h-14"
              maxLength={30}
              data-testid="input-name"
            />
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full gap-2 text-lg"
            style={{backgroundColor: '#7C3AED'}}
            data-testid="button-name-submit"
          >
            Let's Go, {name.trim() || "..."}!
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
