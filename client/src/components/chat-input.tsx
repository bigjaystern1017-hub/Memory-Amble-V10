import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function ChatInput({ onSend, placeholder = "Type your answer...", disabled, autoFocus = true }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, placeholder]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2.5" data-testid="chat-input-container">
      {speechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          data-testid="button-microphone"
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          className={`h-14 w-14 flex items-center justify-center rounded-xl border transition-all duration-150 shrink-0 ${
            isListening
              ? "bg-[#6D2DE2] border-[#6D2DE2] text-white shadow-md shadow-purple-200"
              : "bg-white border-stone-200 text-stone-500 hover:border-purple-300 hover:text-purple-600"
          } disabled:opacity-40`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      )}

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : placeholder}
        disabled={disabled}
        className="flex-1 h-14 px-5 rounded-xl border border-stone-200 bg-white text-xl text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all disabled:opacity-40"
        data-testid="input-chat"
      />

      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        data-testid="button-send"
        aria-label="Send message"
        className="h-14 w-14 flex items-center justify-center rounded-xl bg-[#6D2DE2] text-white shrink-0 shadow-md shadow-purple-200 hover:bg-[#5B2BC4] transition-all duration-150 disabled:opacity-40 disabled:shadow-none"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
