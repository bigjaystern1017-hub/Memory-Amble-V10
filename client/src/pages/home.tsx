import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { EducationSlides } from "@/components/education-slides";
import { NameEntry } from "@/components/name-entry";
import { ProgressBar } from "@/components/progress-bar";
import {
  type BeatId,
  type ConversationState,
  getTimbukMessage,
  getNextBeat,
  beatNeedsUserInput,
  beatNeedsContinueButton,
  getInputPlaceholder,
  getProgressStep,
} from "@/components/beat-engine";
import { apiRequest } from "@/lib/queryClient";
import { Brain, RotateCcw, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: "timbuk" | "gladys";
  text: string;
  typewriter?: boolean;
}

export default function Home() {
  const [phase, setPhase] = useState<"education" | "name" | "chat">("education");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentBeat, setCurrentBeat] = useState<BeatId>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [genError, setGenError] = useState(false);
  const [showSparkButton, setShowSparkButton] = useState(false);
  const [sparkLoading, setSparkLoading] = useState(false);
  const [typewriterBusy, setTypewriterBusy] = useState(false);
  const [state, setState] = useState<ConversationState>({
    userName: "",
    placeName: "",
    stops: [],
    assignments: [],
    userScenes: [],
    userAnswers: [],
    correctCount: 0,
  });

  const msgIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  const typewriterResolveRef = useRef<(() => void) | null>(null);

  const progressStep = getProgressStep(currentBeat);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  }, []);

  const addUserMessage = useCallback(
    (text: string) => {
      const id = ++msgIdRef.current;
      setMessages((prev) => [...prev, { id, sender: "gladys", text }]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const showTimbukWithTypewriter = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
          setIsTyping(false);
          const id = ++msgIdRef.current;
          setMessages((prev) => [...prev, { id, sender: "timbuk", text, typewriter: true }]);
          setTypewriterBusy(true);
          typewriterResolveRef.current = resolve;
          scrollToBottom();
        }, 500);
      });
    },
    [scrollToBottom]
  );

  const handleTypewriterDone = useCallback(() => {
    setTypewriterBusy(false);
    if (typewriterResolveRef.current) {
      const resolve = typewriterResolveRef.current;
      typewriterResolveRef.current = null;
      resolve();
    }
  }, []);

  const addTimbukInstant = useCallback(
    (text: string) => {
      const id = ++msgIdRef.current;
      setMessages((prev) => [...prev, { id, sender: "timbuk", text }]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const fetchAssignments = useCallback(
    async (currentState: ConversationState): Promise<ConversationState | null> => {
      try {
        const response = await apiRequest("POST", "/api/assign-objects", {
          stops: currentState.stops,
        });
        const data = await response.json();
        return { ...currentState, assignments: data.assignments };
      } catch {
        return null;
      }
    },
    []
  );

  const advanceBeat = useCallback(
    async (beat: BeatId, currentState: ConversationState) => {
      if (beat === "assigning") {
        setIsTyping(true);
        scrollToBottom();
        const newState = await fetchAssignments(currentState);
        setIsTyping(false);

        if (!newState || !newState.assignments?.length) {
          setGenError(true);
          addTimbukInstant(
            "Oh dear, I had a little hiccup picking the objects. Could you tap the button below to let me try again?"
          );
          return;
        }

        setState(newState);
        const nextBeat = getNextBeat("assigning");
        if (nextBeat) {
          setCurrentBeat(nextBeat);
          await advanceBeat(nextBeat, newState);
        }
        return;
      }

      const text = getTimbukMessage(beat, currentState);
      if (!text) return;

      await showTimbukWithTypewriter(text);

      if (beat === "final") {
        setIsFinished(true);
        return;
      }

      if (beatNeedsContinueButton(beat)) {
        setShowContinue(true);
        return;
      }

      if (beatNeedsUserInput(beat)) {
        setInputEnabled(true);
        if (beat === "place-object-1" || beat === "place-object-2" || beat === "place-object-3") {
          setShowSparkButton(true);
        } else {
          setShowSparkButton(false);
        }
        return;
      }

      const next = getNextBeat(beat);
      if (next) {
        setCurrentBeat(next);
        await advanceBeat(next, currentState);
      }
    },
    [showTimbukWithTypewriter, addTimbukInstant, scrollToBottom, fetchAssignments]
  );

  const handleEducationComplete = useCallback(() => {
    setPhase("name");
  }, []);

  const handleNameSubmit = useCallback((name: string) => {
    const updatedState = { ...state, userName: name };
    setState(updatedState);
    setPhase("chat");
    setTimeout(() => {
      advanceBeat("welcome", updatedState);
    }, 200);
  }, [state, advanceBeat]);

  const handleContinue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setShowContinue(false);

    const next = getNextBeat(currentBeat);
    if (next) {
      setCurrentBeat(next);
      await advanceBeat(next, state);
    }
    processingRef.current = false;
  }, [currentBeat, state, advanceBeat]);

  const handleRetry = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setGenError(false);
    setCurrentBeat("assigning");
    await advanceBeat("assigning", state);
    processingRef.current = false;
  }, [state, advanceBeat]);

  const handleSpark = useCallback(async () => {
    if (sparkLoading) return;
    setSparkLoading(true);

    const objectIndex =
      currentBeat === "place-object-1" ? 0 :
      currentBeat === "place-object-2" ? 1 : 2;
    const assignment = state.assignments[objectIndex];

    if (!assignment) {
      setSparkLoading(false);
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/spark", {
        object: assignment.object,
        stopName: assignment.stopName,
        placeName: state.placeName,
      });
      const data = await response.json();
      if (data.spark) {
        addTimbukInstant(`Here's a little nudge to get you going: "${data.spark}"\n\nBut that's just a starting point, ${state.userName}. Make it yours -- what do you actually see?`);
      }
    } catch {
      addTimbukInstant("Hmm, my imagination took a coffee break on that one. No worries -- just tell me the first silly thing that pops into your head!");
    }
    setSparkLoading(false);
  }, [currentBeat, state, sparkLoading, addTimbukInstant]);

  const handleUserInput = useCallback(
    async (text: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setInputEnabled(false);
      setShowSparkButton(false);
      addUserMessage(text);

      let updatedState = { ...state };
      const beat = currentBeat;

      switch (beat) {
        case "ask-place":
          updatedState = { ...updatedState, placeName: text };
          break;

        case "ask-stop-1":
          updatedState = { ...updatedState, stops: [text] };
          break;

        case "ask-stop-2":
          updatedState = { ...updatedState, stops: [...updatedState.stops, text] };
          break;

        case "ask-stop-3":
          updatedState = { ...updatedState, stops: [...updatedState.stops, text] };
          break;

        case "place-object-1":
        case "place-object-2":
        case "place-object-3": {
          const sceneIndex =
            beat === "place-object-1" ? 0 :
            beat === "place-object-2" ? 1 : 2;
          const newScenes = [...updatedState.userScenes];
          newScenes[sceneIndex] = text;
          updatedState = { ...updatedState, userScenes: newScenes };
          break;
        }

        case "recall-1":
        case "recall-2":
        case "recall-3": {
          const recallIndex =
            beat === "recall-1" ? 0 : beat === "recall-2" ? 1 : 2;
          const newAnswers = [...updatedState.userAnswers];
          newAnswers[recallIndex] = text;

          const assoc = updatedState.assignments[recallIndex];
          if (assoc) {
            const keyword = assoc.object
              .replace(/^a\s+/i, "")
              .replace(/^an\s+/i, "")
              .replace(/^the\s+/i, "")
              .split(" ")
              .pop()
              ?.toLowerCase() || "";
            const isCorrect = text.toLowerCase().includes(keyword);

            updatedState = {
              ...updatedState,
              userAnswers: newAnswers,
              correctCount: updatedState.correctCount + (isCorrect ? 1 : 0),
            };
          }
          break;
        }
      }

      setState(updatedState);

      const next = getNextBeat(beat);
      if (next) {
        setCurrentBeat(next);
        await advanceBeat(next, updatedState);
      }
      processingRef.current = false;
    },
    [currentBeat, state, addUserMessage, advanceBeat]
  );

  const handleRestart = () => {
    const freshState: ConversationState = {
      userName: "",
      placeName: "",
      stops: [],
      assignments: [],
      userScenes: [],
      userAnswers: [],
      correctCount: 0,
    };
    setPhase("education");
    setMessages([]);
    setCurrentBeat("welcome");
    setIsTyping(false);
    setInputEnabled(false);
    setShowContinue(false);
    setIsFinished(false);
    setGenError(false);
    setShowSparkButton(false);
    setSparkLoading(false);
    setTypewriterBusy(false);
    typewriterResolveRef.current = null;
    setState(freshState);
    msgIdRef.current = 0;
    processingRef.current = false;
  };

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : -1;

  if (phase === "education") {
    return (
      <div className="flex flex-col h-screen bg-background" data-testid="app-container">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                MemoryAmble
              </h1>
              <p className="text-sm text-muted-foreground">Coach Timbuk</p>
            </div>
          </div>
          <div className="border-t border-border/30">
            <div className="max-w-3xl mx-auto px-4 md:px-6">
              <ProgressBar currentStep={0} />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <EducationSlides onComplete={handleEducationComplete} />
        </div>
      </div>
    );
  }

  if (phase === "name") {
    return (
      <div className="flex flex-col h-screen bg-background" data-testid="app-container">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                MemoryAmble
              </h1>
              <p className="text-sm text-muted-foreground">Coach Timbuk</p>
            </div>
          </div>
          <div className="border-t border-border/30">
            <div className="max-w-3xl mx-auto px-4 md:px-6">
              <ProgressBar currentStep={0} />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <NameEntry onSubmit={handleNameSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="app-container">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                MemoryAmble
              </h1>
              <p className="text-sm text-muted-foreground">Coach Timbuk</p>
            </div>
          </div>
          {isFinished && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestart}
              className="gap-2"
              data-testid="button-restart"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          )}
        </div>
        <div className="border-t border-border/30">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <ProgressBar currentStep={progressStep} />
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        data-testid="chat-scroll"
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              sender={msg.sender}
              text={msg.text}
              typewriter={msg.typewriter && msg.id === lastMessageId}
              onTypewriterDone={msg.id === lastMessageId ? handleTypewriterDone : undefined}
            />
          ))}
          {isTyping && <ChatMessage sender="timbuk" text="" isTyping />}
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          {isFinished ? (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleRestart}
                className="gap-2"
                data-testid="button-restart-bottom"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again with a New Palace
              </Button>
            </div>
          ) : genError ? (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleRetry}
                className="gap-2"
                data-testid="button-retry"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </Button>
            </div>
          ) : showContinue ? (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleContinue}
                className="gap-2"
                data-testid="button-continue"
              >
                I'm Ready, Let's Go!
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <ChatInput
                onSend={handleUserInput}
                placeholder={getInputPlaceholder(currentBeat)}
                disabled={!inputEnabled || isTyping || typewriterBusy}
              />
              {showSparkButton && inputEnabled && !typewriterBusy && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSpark}
                    disabled={sparkLoading}
                    className="gap-2 text-muted-foreground"
                    data-testid="button-spark"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {sparkLoading ? "Thinking..." : "Stuck? Get a spark from Timbuk"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
